import User from '../models/User.js';
import Shop from '../models/Shop.js';
import RationCard from '../models/RationCard.js';
import Booking from '../models/Booking.js';
import DistributionRecord from '../models/DistributionRecord.js';
import Stock from '../models/Stock.js';
import Payment from '../models/Payment.js';

// Get high-level system metrics & charts data
export const getAdminStats = async (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const todayString = new Date().toISOString().slice(0, 10);

    const [
      totalUsers,
      totalBeneficiaries,
      totalShopOwners,
      totalShops,
      totalRationCards,
      totalBookings,
      activeBookingsToday,
      monthlyDistributionsCount,
      totalRevenueData,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'BENEFICIARY' }),
      User.countDocuments({ role: 'SHOP_OWNER' }),
      Shop.countDocuments({ isActive: true }),
      RationCard.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ dateString: todayString, status: 'CONFIRMED' }),
      DistributionRecord.countDocuments({ monthCycle: currentMonth }),
      Payment.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

    // Ration cards breakdown by type (AAY, PHH, NPHH)
    const cardsByType = await RationCard.aggregate([
      { $group: { _id: '$cardType', count: { $sum: 1 } } },
    ]);

    // Commodity distribution totals for the current month
    const commodityBreakdown = await DistributionRecord.aggregate([
      { $match: { monthCycle: currentMonth } },
      { $unwind: '$itemsDistributed' },
      {
        $group: {
          _id: '$itemsDistributed.commodity',
          totalQuantity: { $sum: '$itemsDistributed.quantity' },
          unit: { $first: '$itemsDistributed.unit' },
          totalRevenue: { $sum: '$itemsDistributed.itemTotal' },
        },
      },
    ]);

    // Distribution trend over past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyDistributionTrend = await DistributionRecord.aggregate([
      { $match: { distributedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$distributedAt' } },
          distributions: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Low stock warnings across all shops
    const lowStockItems = await Stock.find({
      $expr: { $lt: ['$availableQuantity', { $multiply: ['$allocatedMonthlyQuantity', 0.2] }] },
    })
      .populate('shopId', 'shopName fpsCode district')
      .limit(10);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalBeneficiaries,
        totalShopOwners,
        totalShops,
        totalRationCards,
        totalBookings,
        activeBookingsToday,
        monthlyDistributionsCount,
        totalRevenue,
        currentMonth,
      },
      charts: {
        cardsByType: cardsByType.map((c) => ({ type: c._id, count: c.count })),
        commodityBreakdown,
        dailyDistributionTrend,
      },
      lowStockAlerts: lowStockItems,
    });
  } catch (error) {
    next(error);
  }
};

// Manage Users: List users with search and pagination
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { rationCardNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user status (activate / deactivate)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && user._id.toString() === req.userId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own administrator account.' });
    }

    user.isActive = !user.isActive;
    if (user.isActive) {
      user.isApproved = true;
      user.approvalStatus = 'APPROVED';
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Approve pending shop owner account
export const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isApproved = true;
    user.isActive = true;
    user.approvalStatus = 'APPROVED';
    await user.save();

    // If shop owner, activate linked shop
    if (user.role === 'SHOP_OWNER' && user.shopId) {
      await Shop.findByIdAndUpdate(user.shopId, { isActive: true, ownerId: user._id });
    }

    res.status(200).json({
      success: true,
      message: `Shop Owner account ${user.name} has been authorized and activated.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new Fair Price Shop
export const createShop = async (req, res, next) => {
  try {
    const {
      fpsCode,
      shopName,
      shopNameTa,
      address,
      taluk,
      district,
      pincode,
      contactNumber,
      operatingHours,
      slotCapacity = 6,
    } = req.body;

    const existing = await Shop.findOne({ fpsCode: fpsCode.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A Fair Price Shop with code ${fpsCode} already exists.`,
      });
    }

    const shop = await Shop.create({
      fpsCode: fpsCode.trim().toUpperCase(),
      shopName,
      shopNameTa: shopNameTa || '',
      address,
      taluk,
      district,
      pincode,
      contactNumber,
      operatingHours: operatingHours || { open: '09:00', close: '18:00', lunchStart: '13:00', lunchEnd: '14:00' },
      slotCapacity,
    });

    // Initialize initial default stock records for the new shop
    const defaultCommodities = [
      { commodity: 'RICE', commodityName: 'Rice (அரிசி)', unit: 'kg', availableQuantity: 3000, allocatedMonthlyQuantity: 4000, ratePerUnit: 0 },
      { commodity: 'WHEAT', commodityName: 'Wheat (கோதுமை)', unit: 'kg', availableQuantity: 800, allocatedMonthlyQuantity: 1000, ratePerUnit: 2 },
      { commodity: 'SUGAR', commodityName: 'Sugar (சர்க்கரை)', unit: 'kg', availableQuantity: 400, allocatedMonthlyQuantity: 500, ratePerUnit: 13.5 },
      { commodity: 'KEROSENE', commodityName: 'Kerosene (மண்ணெண்ணெய்)', unit: 'litre', availableQuantity: 200, allocatedMonthlyQuantity: 300, ratePerUnit: 15 },
      { commodity: 'DAL', commodityName: 'Toor Dal (பருப்பு)', unit: 'kg', availableQuantity: 250, allocatedMonthlyQuantity: 350, ratePerUnit: 30 },
    ];

    await Promise.all(
      defaultCommodities.map((item) =>
        Stock.create({
          shopId: shop._id,
          ...item,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Fair Price Shop and initial commodity stock created successfully.',
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// Update shop details
export const updateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully.',
      shop,
    });
  } catch (error) {
    next(error);
  }
};
