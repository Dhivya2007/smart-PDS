import RationCard from '../models/RationCard.js';
import User from '../models/User.js';

// Verify a Ration Card using Card Number and Aadhaar Last 4 digits of Head of Family
export const verifyCard = async (req, res, next) => {
  try {
    const { cardNumber, aadhaarLast4 } = req.body;

    if (!cardNumber || !aadhaarLast4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Ration Card Number and Aadhaar last 4 digits.',
      });
    }

    const card = await RationCard.findOne({
      cardNumber: cardNumber.trim().toUpperCase(),
    }).populate('fpsId');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Ration card not found in the national/state PDS database.',
      });
    }

    // Check Aadhaar match with Head of Family
    if (card.headOfFamily.aadhaarLast4 !== aadhaarLast4.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar verification failed. Last 4 digits do not match the registered Head of Family record.',
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    const eligibility = card.isEligibleForCycle(currentMonth);

    res.status(200).json({
      success: true,
      message: 'Ration card verified successfully.',
      card: {
        _id: card._id,
        cardNumber: card.cardNumber,
        cardType: card.cardType,
        headOfFamily: card.headOfFamily,
        memberCount: (card.members || []).length + 1,
        members: card.members,
        address: card.address,
        fairPriceShop: card.fpsId,
        monthlyEntitlement: card.monthlyEntitlement,
        lastCollectedMonth: card.lastCollectedMonth,
        isEligibleThisMonth: eligibility.eligible,
        eligibilityReason: eligibility.reason || null,
        isLinked: !!card.linkedUserId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Link verified ration card to authenticated user account
export const linkCardToUser = async (req, res, next) => {
  try {
    const { cardNumber, aadhaarLast4 } = req.body;
    const userId = req.userId;

    const card = await RationCard.findOne({
      cardNumber: cardNumber.trim().toUpperCase(),
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Ration card not found.',
      });
    }

    if (card.headOfFamily.aadhaarLast4 !== aadhaarLast4.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar verification failed.',
      });
    }

    if (card.linkedUserId && card.linkedUserId.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This ration card is already linked to another user account.',
      });
    }

    // Update card
    card.linkedUserId = userId;
    await card.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      rationCardNumber: card.cardNumber,
      rationCardId: card._id,
    });

    const populatedCard = await RationCard.findById(card._id).populate('fpsId');

    res.status(200).json({
      success: true,
      message: 'Ration card successfully linked to your account.',
      card: populatedCard,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's linked ration card
export const getMyCard = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.rationCardId) {
      return res.status(404).json({
        success: false,
        message: 'No ration card is linked to your account yet.',
      });
    }

    const card = await RationCard.findById(user.rationCardId).populate('fpsId');
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Linked ration card record not found.',
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const eligibility = card.isEligibleForCycle(currentMonth);

    res.status(200).json({
      success: true,
      card,
      currentMonth,
      eligibility,
    });
  } catch (error) {
    next(error);
  }
};
