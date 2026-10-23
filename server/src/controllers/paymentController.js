import Payment from '../models/Payment.js';
import paymentService from '../services/paymentService.js';
import { sendNotification } from '../services/notificationService.js';

// Get payment for booking
export const getPaymentByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId })
      .populate('shopId', 'shopName fpsCode')
      .populate('rationCardId', 'cardNumber cardType');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this booking.',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Simulate Mock Online Payment Gateway
export const simulateMockOnlinePayment = async (req, res, next) => {
  try {
    const { paymentId, simulateStatus = 'SUCCESS' } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required.',
      });
    }

    const result = await paymentService.processMockOnlinePayment({
      paymentId,
      simulateStatus,
    });

    if (result.success) {
      await sendNotification({
        userId: result.payment.userId,
        title: `Payment Received: ₹${result.payment.amount}`,
        titleTa: `கட்டணம் பெறப்பட்டது: ₹${result.payment.amount}`,
        message: `Your payment of ₹${result.payment.amount} (Txn: ${result.payment.transactionId}) was successfully processed via Mock Gateway.`,
        messageTa: `உங்கள் கட்டணம் ₹${result.payment.amount} வெற்றிகரமாக செலுத்தப்பட்டது.`,
        type: 'PAYMENT',
        metadata: { paymentId: result.payment._id, transactionId: result.payment.transactionId },
      });
    }

    res.status(200).json({
      success: result.success,
      status: result.status,
      message: result.message,
      payment: result.payment,
    });
  } catch (error) {
    next(error);
  }
};

// Confirm cash payment by shop owner
export const confirmCashPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const shopOwnerId = req.userId;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required.',
      });
    }

    const payment = await paymentService.confirmCashPayment({
      paymentId,
      shopOwnerId,
    });

    res.status(200).json({
      success: true,
      message: 'Cash payment confirmed by Fair Price Shop owner.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
