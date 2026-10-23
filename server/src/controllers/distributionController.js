import crypto from 'crypto';
import QueueToken from '../models/QueueToken.js';
import Booking from '../models/Booking.js';
import RationCard from '../models/RationCard.js';
import Shop from '../models/Shop.js';
import Stock from '../models/Stock.js';
import Payment from '../models/Payment.js';
import DistributionRecord from '../models/DistributionRecord.js';
import { verifyAndParseQR } from '../services/qrService.js';
import paymentService from '../services/paymentService.js';
import { sendNotification } from '../services/notificationService.js';

// Verify a QR token scanned by the shop owner
export const verifyToken = async (req, res, next) => {
  try {
    const { qrData, tokenCode } = req.body;
    const shopOwnerId = req.userId;

    // 1. Identify shop owned by this shop owner
    let shop = await Shop.findOne({ ownerId: shopOwnerId });
    if (!shop) {
      // Check if user has shopId attached
      if (req.user.shopId) {
        shop = await Shop.findById(req.user.shopId);
      }
    }

    if (!shop && req.userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No Fair Price Shop is assigned to your account.',
      });
    }

    let searchCode = tokenCode ? tokenCode.trim().toUpperCase() : null;

    if (!searchCode && qrData) {
      const parsed = verifyAndParseQR(qrData);
      if (!parsed.valid) {
        return res.status(400).json({
          success: false,
          message: parsed.error || 'Invalid QR code signature or corrupted QR data.',
        });
      }
      searchCode = parsed.data.tokenCode;
    }

    if (!searchCode) {
      return res.status(400).json({
        success: false,
        message: 'Token code or QR payload is required.',
      });
    }

    // 2. Fetch QueueToken from database
    const token = await QueueToken.findOne({ tokenCode: searchCode })
      .populate('bookingId')
      .populate({
        path: 'rationCardId',
        populate: { path: 'fpsId' },
      })
      .populate('shopId');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: `Token ${searchCode} not found in the system registry.`,
      });
    }

    // 3. Check token status
    if (token.status === 'USED') {
      return res.status(400).json({
        success: false,
        message: `Token ${searchCode} has ALREADY BEEN USED on ${token.verifiedAt ? new Date(token.verifiedAt).toLocaleString() : 'earlier date'}. Duplicate distribution rejected.`,
      });
    }

    if (token.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Token ${searchCode} is CANCELLED and invalid.`,
      });
    }

    if (token.status === 'EXPIRED' || new Date() > new Date(token.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: `Token ${searchCode} has EXPIRED.`,
      });
    }

    // 4. Validate that token belongs to this shop (unless Admin)
    if (shop && token.shopId._id.toString() !== shop._id.toString()) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized: This token belongs to Fair Price Shop ${token.shopId.fpsCode} (${token.shopId.shopName}), not your shop.`,
      });
    }

    // 5. Check booking validity
    const booking = token.bookingId;
    if (!booking || booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Booking is not active (current status: ${booking ? booking.status : 'Missing'}).`,
      });
    }

    // 6. Check monthly eligibility of RationCard
    const rationCard = token.rationCardId;
    if (!rationCard.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ration card is inactive or suspended.',
      });
    }

    if (rationCard.lastCollectedMonth === booking.monthCycle) {
      return res.status(400).json({
        success: false,
        message: `Quota for month ${booking.monthCycle} has already been collected for ration card ${rationCard.cardNumber}.`,
      });
    }

    // 7. Check payment status
    const payment = await Payment.findOne({ bookingId: booking._id });

    // 8. Check stock availability in shop for this ration card's entitlement
    const shopStocks = await Stock.find({ shopId: token.shopId._id });
    const stockMap = {};
    shopStocks.forEach((s) => {
      stockMap[s.commodity] = s.availableQuantity;
    });

    const entitlement = rationCard.monthlyEntitlement;
    const stockStatus = [
      {
        commodity: 'RICE',
        required: entitlement.riceKg,
        available: stockMap['RICE'] || 0,
        hasSufficient: (stockMap['RICE'] || 0) >= entitlement.riceKg,
      },
      {
        commodity: 'WHEAT',
        required: entitlement.wheatKg,
        available: stockMap['WHEAT'] || 0,
        hasSufficient: (stockMap['WHEAT'] || 0) >= entitlement.wheatKg,
      },
      {
        commodity: 'SUGAR',
        required: entitlement.sugarKg,
        available: stockMap['SUGAR'] || 0,
        hasSufficient: (stockMap['SUGAR'] || 0) >= entitlement.sugarKg,
      },
      {
        commodity: 'KEROSENE',
        required: entitlement.keroseneLitre,
        available: stockMap['KEROSENE'] || 0,
        hasSufficient: (stockMap['KEROSENE'] || 0) >= entitlement.keroseneLitre,
      },
      {
        commodity: 'DAL',
        required: entitlement.dalKg,
        available: stockMap['DAL'] || 0,
        hasSufficient: (stockMap['DAL'] || 0) >= entitlement.dalKg,
      },
    ];

    const allStockSufficient = stockStatus.every((s) => s.hasSufficient);

    res.status(200).json({
      success: true,
      message: 'Token verified successfully. Ready for distribution.',
      token: {
        _id: token._id,
        tokenCode: token.tokenCode,
        status: token.status,
        expiresAt: token.expiresAt,
      },
      booking: {
        _id: booking._id,
        dateString: booking.dateString,
        slotTime: booking.slotTime,
        monthCycle: booking.monthCycle,
      },
      rationCard: {
        _id: rationCard._id,
        cardNumber: rationCard.cardNumber,
        cardType: rationCard.cardType,
        headOfFamily: rationCard.headOfFamily,
        members: rationCard.members,
        monthlyEntitlement: rationCard.monthlyEntitlement,
      },
      payment: payment
        ? {
            _id: payment._id,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            status: payment.status,
            transactionId: payment.transactionId,
          }
        : null,
      stockStatus,
      allStockSufficient,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm distribution and record transaction
export const confirmDistribution = async (req, res, next) => {
  try {
    const { tokenCode, collectedByMemberAadhaarLast4, collectedByMemberName } = req.body;
    const shopOwnerId = req.userId;

    if (!tokenCode) {
      return res.status(400).json({
        success: false,
        message: 'Token code is required to execute distribution.',
      });
    }

    // 1. Fetch and atomically lock/verify token
    const token = await QueueToken.findOne({ tokenCode: tokenCode.trim().toUpperCase() })
      .populate('bookingId')
      .populate('rationCardId')
      .populate('shopId');

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    if (token.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Token cannot be processed. Current status is ${token.status}.`,
      });
    }

    const booking = token.bookingId;
    const rationCard = token.rationCardId;
    const shop = token.shopId;
    const monthCycle = booking.monthCycle;

    // 2. Validate monthly collection rule
    if (rationCard.lastCollectedMonth === monthCycle) {
      return res.status(400).json({
        success: false,
        message: `Ration quota for cycle ${monthCycle} has already been collected. Duplicate distribution blocked.`,
      });
    }

    // 3. Check existing distribution record
    const existingRecord = await DistributionRecord.findOne({
      rationCardId: rationCard._id,
      monthCycle,
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: `A distribution record already exists for this ration card in cycle ${monthCycle}.`,
      });
    }

    // 4. Fetch payment
    let payment = await Payment.findOne({ bookingId: booking._id });
    if (!payment) {
      // Create cash payment on the fly if missing
      payment = await paymentService.createPaymentOrder({
        bookingId: booking._id,
        rationCardId: rationCard._id,
        userId: booking.userId,
        shopId: shop._id,
        amount: rationCard.monthlyEntitlement.subsidizedTotalAmount || 40,
        paymentMethod: 'CASH',
      });
    }

    // If payment is CASH and PENDING, mark as COMPLETED by shop owner
    if (payment.paymentMethod === 'CASH' && payment.status === 'PENDING') {
      payment = await paymentService.confirmCashPayment({
        paymentId: payment._id,
        shopOwnerId,
      });
    } else if (payment.paymentMethod === 'ONLINE_MOCK' && payment.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Online payment has not been completed. Please ask beneficiary to complete payment or pay cash at counter.',
      });
    }

    // 5. Prepare items to distribute
    const entitlement = rationCard.monthlyEntitlement;
    const items = [
      {
        commodity: 'RICE',
        commodityName: 'Subsidized Rice (அரிசி)',
        quantity: entitlement.riceKg || 20,
        unit: 'kg',
        ratePerUnit: 0,
        itemTotal: 0,
      },
      {
        commodity: 'WHEAT',
        commodityName: 'Whole Wheat (கோதுமை)',
        quantity: entitlement.wheatKg || 5,
        unit: 'kg',
        ratePerUnit: 2,
        itemTotal: (entitlement.wheatKg || 5) * 2,
      },
      {
        commodity: 'SUGAR',
        commodityName: 'Refined Sugar (சர்க்கரை)',
        quantity: entitlement.sugarKg || 2,
        unit: 'kg',
        ratePerUnit: 13.5,
        itemTotal: (entitlement.sugarKg || 2) * 13.5,
      },
      {
        commodity: 'KEROSENE',
        commodityName: 'Kerosene Oil (மண்ணெண்ணெய்)',
        quantity: entitlement.keroseneLitre || 1,
        unit: 'litre',
        ratePerUnit: 15,
        itemTotal: (entitlement.keroseneLitre || 1) * 15,
      },
      {
        commodity: 'DAL',
        commodityName: 'Toor Dal (துவரம் பருப்பு)',
        quantity: entitlement.dalKg || 1,
        unit: 'kg',
        ratePerUnit: 30,
        itemTotal: (entitlement.dalKg || 1) * 30,
      },
    ];

    // 6. Deduct stock atomically
    for (const item of items) {
      if (item.quantity > 0) {
        const stockRecord = await Stock.findOne({
          shopId: shop._id,
          commodity: item.commodity,
        });

        if (stockRecord) {
          if (stockRecord.availableQuantity < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${item.commodity}. Available: ${stockRecord.availableQuantity} ${stockRecord.unit}, Required: ${item.quantity} ${item.unit}. Please restock before distributing.`,
            });
          }
          stockRecord.availableQuantity -= item.quantity;
          await stockRecord.save();
        }
      }
    }

    // 7. Generate receipt number
    const receiptNumber = `RCP-${monthCycle.replace('-', '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 8. Create Distribution Record
    const distributionRecord = await DistributionRecord.create({
      receiptNumber,
      bookingId: booking._id,
      rationCardId: rationCard._id,
      shopId: shop._id,
      beneficiaryUserId: booking.userId,
      distributedByShopOwnerId: shopOwnerId,
      monthCycle,
      itemsDistributed: items,
      totalAmount: payment.amount,
      paymentId: payment._id,
      paymentMethod: payment.paymentMethod,
      collectedByMember: {
        name: collectedByMemberName || rationCard.headOfFamily.name,
        relation: 'FAMILY_MEMBER',
        aadhaarLast4: collectedByMemberAadhaarLast4 || rationCard.headOfFamily.aadhaarLast4,
      },
      distributedAt: new Date(),
    });

    // 9. Atomic state transitions
    token.status = 'USED';
    token.verifiedAt = new Date();
    token.verifiedBy = shopOwnerId;
    await token.save();

    booking.status = 'DISTRIBUTED';
    booking.distributedAt = new Date();
    await booking.save();

    rationCard.lastCollectedMonth = monthCycle;
    rationCard.lastCollectionDate = new Date();
    await rationCard.save();

    // 10. Send Confirmation Notification to Beneficiary
    await sendNotification({
      userId: booking.userId,
      title: `Ration Distributed - Receipt #${receiptNumber}`,
      titleTa: `ரேஷன் பொருட்கள் வழங்கப்பட்டன - ரசீது #${receiptNumber}`,
      message: `Your monthly ration quota for ${monthCycle} was successfully distributed at ${shop.shopName}. Digital receipt #${receiptNumber} generated.`,
      messageTa: `உங்கள் ${monthCycle} மாத ரேஷன் பொருட்கள் ${shop.shopName} கடையில் வெற்றிகரமாக வழங்கப்பட்டது. ரசீது எண்: #${receiptNumber}.`,
      type: 'DISTRIBUTION',
      metadata: { receiptNumber, distributionId: distributionRecord._id },
    });

    res.status(200).json({
      success: true,
      message: 'Ration commodities successfully distributed and stock updated.',
      receipt: distributionRecord,
    });
  } catch (error) {
    next(error);
  }
};

// Get single distribution receipt
export const getReceiptById = async (req, res, next) => {
  try {
    const { receiptId } = req.params;
    let query = { _id: receiptId };

    // Support lookup by receipt number or ID
    if (receiptId.startsWith('RCP-')) {
      query = { receiptNumber: receiptId };
    }

    const receipt = await DistributionRecord.findOne(query)
      .populate('shopId', 'shopName shopNameTa fpsCode address taluk district contactNumber')
      .populate('rationCardId', 'cardNumber cardType headOfFamily address')
      .populate('beneficiaryUserId', 'name phone email')
      .populate('distributedByShopOwnerId', 'name phone')
      .populate('paymentId');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.',
      });
    }

    res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    next(error);
  }
};

// Get distribution history for beneficiary or shop owner
export const getDistributionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.userRole === 'BENEFICIARY') {
      query.beneficiaryUserId = req.userId;
    } else if (req.userRole === 'SHOP_OWNER') {
      let shop = await Shop.findOne({ ownerId: req.userId });
      if (shop) {
        query.shopId = shop._id;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      DistributionRecord.find(query)
        .populate('shopId', 'shopName fpsCode')
        .populate('rationCardId', 'cardNumber cardType headOfFamily')
        .populate('beneficiaryUserId', 'name phone')
        .sort({ distributedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DistributionRecord.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (error) {
    next(error);
  }
};
