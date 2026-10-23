import Booking from '../models/Booking.js';
import RationCard from '../models/RationCard.js';
import Shop from '../models/Shop.js';
import QueueToken from '../models/QueueToken.js';
import Payment from '../models/Payment.js';
import { generateQueueToken } from '../services/qrService.js';
import paymentService from '../services/paymentService.js';
import { sendNotification } from '../services/notificationService.js';

// Create a new slot booking
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { dateString, slotTime, paymentMethod = 'CASH' } = req.body;

    if (!dateString || !slotTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both date (YYYY-MM-DD) and slotTime (e.g. 09:00 - 09:15).',
      });
    }

    // 1. Get user's linked ration card
    const card = await RationCard.findOne({ linkedUserId: userId }).populate('fpsId');
    if (!card) {
      return res.status(400).json({
        success: false,
        message: 'No verified ration card is linked to your account. Please verify and link your card first.',
      });
    }

    if (!card.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your ration card is inactive or suspended. Cannot book slots.',
      });
    }

    const shop = card.fpsId;
    if (!shop || !shop.isActive) {
      return res.status(400).json({
        success: false,
        message: 'The Fair Price Shop linked to your card is currently unavailable.',
      });
    }

    // 2. Validate booking date
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book slots in the past.',
      });
    }

    const monthCycle = dateString.slice(0, 7); // "YYYY-MM"

    // 3. Rule: Check if ration quota already collected this month
    if (card.lastCollectedMonth === monthCycle) {
      return res.status(400).json({
        success: false,
        message: `Ration quota for cycle ${monthCycle} has already been collected for this card. Only one collection is permitted per monthly cycle.`,
      });
    }

    // 4. Rule: Prevent multiple active bookings in the same monthly cycle
    const existingActiveBooking = await Booking.findOne({
      rationCardId: card._id,
      monthCycle,
      status: 'CONFIRMED',
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: `An active booking already exists for this ration card on ${existingActiveBooking.dateString} at ${existingActiveBooking.slotTime}. You can only have one active booking per monthly cycle.`,
      });
    }

    // 5. Rule: Check slot capacity
    const currentSlotBookingsCount = await Booking.countDocuments({
      shopId: shop._id,
      dateString,
      slotTime,
      status: 'CONFIRMED',
    });

    const maxCapacity = shop.slotCapacity || 6;
    if (currentSlotBookingsCount >= maxCapacity) {
      return res.status(409).json({
        success: false,
        message: `The selected time slot (${slotTime}) is fully booked. Please select an alternate slot.`,
      });
    }

    // 6. Create booking with atomic compound index protection
    const booking = new Booking({
      rationCardId: card._id,
      userId,
      shopId: shop._id,
      bookingDate,
      dateString,
      slotTime,
      monthCycle,
      status: 'CONFIRMED',
    });

    await booking.save();

    // Secondary race condition check on capacity
    const recheckedCount = await Booking.countDocuments({
      shopId: shop._id,
      dateString,
      slotTime,
      status: 'CONFIRMED',
    });

    if (recheckedCount > maxCapacity) {
      // Rollback this booking if concurrent race exceeded slot capacity
      await Booking.findByIdAndDelete(booking._id);
      return res.status(409).json({
        success: false,
        message: 'This time slot was just taken by another beneficiary. Please choose another slot.',
      });
    }

    // 7. Generate cryptographic Queue Token and QR code
    const queueToken = await generateQueueToken({
      booking,
      rationCard: card,
      shop,
    });

    booking.tokenRef = queueToken._id;
    booking.tokenCode = queueToken.tokenCode;
    await booking.save();

    // 8. Create initial payment record
    const amount = card.monthlyEntitlement?.subsidizedTotalAmount || 40;
    const payment = await paymentService.createPaymentOrder({
      bookingId: booking._id,
      rationCardId: card._id,
      userId,
      shopId: shop._id,
      amount,
      paymentMethod: paymentMethod === 'ONLINE_MOCK' ? 'ONLINE_MOCK' : 'CASH',
    });

    // 9. Send Notification
    await sendNotification({
      userId,
      userEmail: req.user.email,
      title: `Slot Booked: ${slotTime} on ${dateString}`,
      titleTa: `நேர இடைவெளி முன்பதிவு செய்யப்பட்டது: ${dateString} ${slotTime}`,
      message: `Your ration collection slot is confirmed at ${shop.shopName} (${shop.fpsCode}). Token: ${queueToken.tokenCode}. Present your QR code at the shop.`,
      messageTa: `உங்கள் நியாயவிலைக் கடை (${shop.shopName}) நேர இடைவெளி உறுதி செய்யப்பட்டது. டோக்கன் எண்: ${queueToken.tokenCode}. கடையின் கவுண்டரில் உங்கள் QR குறியீட்டைக் காண்பிக்கவும்.`,
      type: 'BOOKING',
      metadata: { bookingId: booking._id, tokenCode: queueToken.tokenCode },
    });

    res.status(201).json({
      success: true,
      message: 'Slot successfully booked and QR token generated.',
      booking,
      queueToken,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('shopId', 'shopName shopNameTa fpsCode address taluk contactNumber')
      .populate('tokenRef')
      .populate('rationCardId', 'cardNumber cardType monthlyEntitlement')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get single booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('shopId')
      .populate('tokenRef')
      .populate('rationCardId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Role check: Beneficiary can only see their own booking
    if (req.userRole === 'BENEFICIARY' && booking.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view another beneficiary’s booking.',
      });
    }

    // Fetch related payment
    const payment = await Payment.findOne({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Check ownership
    if (req.userRole === 'BENEFICIARY' && booking.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot cancel another user’s booking.',
      });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}.`,
      });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    // Mark token CANCELLED
    if (booking.tokenRef) {
      await QueueToken.findByIdAndUpdate(booking.tokenRef, { status: 'CANCELLED' });
    }

    // Mark payment REFUNDED/CANCELLED if exists
    await Payment.updateMany(
      { bookingId: booking._id, status: 'PENDING' },
      { status: 'REFUNDED' }
    );

    // Send notification
    await sendNotification({
      userId: booking.userId,
      userEmail: req.user.email,
      title: `Booking Cancelled: ${booking.dateString}`,
      titleTa: `முன்பதிவு ரத்து செய்யப்பட்டது: ${booking.dateString}`,
      message: `Your slot booking for ${booking.slotTime} on ${booking.dateString} has been cancelled.`,
      messageTa: `உங்கள் ${booking.dateString} ${booking.slotTime} நேர முன்பதிவு ரத்து செய்யப்பட்டது.`,
      type: 'BOOKING',
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};
