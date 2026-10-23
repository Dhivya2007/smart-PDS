import Shop from '../models/Shop.js';
import { getAvailableSlotsForShopAndDate } from '../services/slotService.js';

// Get list of shops with search and filtering
export const getAllShops = async (req, res, next) => {
  try {
    const { search, taluk, district, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { fpsCode: { $regex: search, $options: 'i' } },
        { taluk: { $regex: search, $options: 'i' } },
      ];
    }
    if (taluk) query.taluk = taluk;
    if (district) query.district = district;

    const skip = (Number(page) - 1) * Number(limit);
    const [shops, total] = await Promise.all([
      Shop.find(query).skip(skip).limit(Number(limit)).sort({ fpsCode: 1 }),
      Shop.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      shops,
    });
  } catch (error) {
    next(error);
  }
};

// Get single shop by ID
export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Fair Price Shop not found',
      });
    }

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// Get 15-minute slot availability for a shop on a specified date
export const getShopAvailableSlots = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date query parameter (YYYY-MM-DD).',
      });
    }

    // Verify date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check or book slots for past dates.',
      });
    }

    const slotData = await getAvailableSlotsForShopAndDate(shopId, date);

    res.status(200).json({
      success: true,
      ...slotData,
    });
  } catch (error) {
    next(error);
  }
};
