import Stock from '../models/Stock.js';
import Shop from '../models/Shop.js';

// Get current stock for a shop
export const getShopStock = async (req, res, next) => {
  try {
    let shopId = req.params.shopId;

    // If shop owner requesting without param, look up their own shop
    if (!shopId && req.userRole === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.userId });
      if (shop) shopId = shop._id;
    }

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID is required.',
      });
    }

    const stocks = await Stock.find({ shopId }).sort({ commodity: 1 });
    const shop = await Shop.findById(shopId);

    // Check for low stock thresholds (e.g. less than 15% of monthly allocation)
    const stockWithAlerts = stocks.map((item) => {
      const isLowStock = item.availableQuantity < (item.allocatedMonthlyQuantity * 0.15);
      return {
        ...item.toObject(),
        isLowStock,
      };
    });

    res.status(200).json({
      success: true,
      shop: shop ? { _id: shop._id, name: shop.shopName, fpsCode: shop.fpsCode } : null,
      stock: stockWithAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// Restock commodity inventory
export const restockCommodity = async (req, res, next) => {
  try {
    const { shopId, commodity, quantityAdded, notes } = req.body;

    if (!shopId || !commodity || !quantityAdded || quantityAdded <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide shopId, commodity, and a valid positive quantityAdded.',
      });
    }

    // Role check: Shop owner can only restock their own shop
    if (req.userRole === 'SHOP_OWNER') {
      const shop = await Shop.findOne({ ownerId: req.userId });
      if (!shop || shop._id.toString() !== shopId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only restock commodities in your own shop.',
        });
      }
    }

    let stockItem = await Stock.findOne({ shopId, commodity });
    if (!stockItem) {
      // Create if doesn't exist
      stockItem = new Stock({
        shopId,
        commodity,
        commodityName: commodity,
        unit: commodity === 'KEROSENE' ? 'litre' : 'kg',
        availableQuantity: 0,
      });
    }

    const previousQuantity = stockItem.availableQuantity;
    const newQuantity = previousQuantity + Number(quantityAdded);

    stockItem.availableQuantity = newQuantity;
    stockItem.lastRestockedAt = new Date();
    stockItem.restockHistory.push({
      quantityAdded: Number(quantityAdded),
      previousQuantity,
      newQuantity,
      restockedBy: req.userId,
      notes: notes || 'Official warehouse stock replenishment',
      date: new Date(),
    });

    await stockItem.save();

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantityAdded} ${stockItem.unit} of ${commodity}. New balance: ${newQuantity} ${stockItem.unit}.`,
      stock: stockItem,
    });
  } catch (error) {
    next(error);
  }
};
