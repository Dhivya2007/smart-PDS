import crypto from 'crypto';
import Payment from '../models/Payment.js';

class PaymentGatewayService {
  /**
   * Initialize a payment order/record
   */
  async createPaymentOrder({ bookingId, rationCardId, userId, shopId, amount, paymentMethod }) {
    // Generate a reference transaction ID
    const refPrefix = paymentMethod === 'CASH' ? 'PDS-CSH' : 'PDS-MCK';
    const transactionId = `${refPrefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const payment = await Payment.create({
      bookingId,
      rationCardId,
      userId,
      shopId,
      amount,
      paymentMethod,
      status: 'PENDING',
      transactionId,
      gatewayResponse: {
        gatewayType: process.env.PAYMENT_GATEWAY_MODE || 'mock',
        isMock: true,
        note: paymentMethod === 'CASH' 
          ? 'Cash payment pending counter verification by Fair Price Shop owner'
          : 'Development Mock Payment Gateway initialized. No real funds debited.',
        createdAt: new Date().toISOString(),
      },
    });

    return payment;
  }

  /**
   * Process Mock Online Payment Gateway simulation
   * simulateStatus: 'SUCCESS' | 'FAILURE' | 'NETWORK_ERROR'
   */
  async processMockOnlinePayment({ paymentId, simulateStatus = 'SUCCESS', beneficiaryAadhaarLast4 }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.status === 'COMPLETED') {
      return { success: true, payment, message: 'Payment has already been completed.' };
    }

    if (payment.paymentMethod !== 'ONLINE_MOCK') {
      throw new Error('Only ONLINE_MOCK payments can be processed through the online gateway simulation.');
    }

    if (simulateStatus === 'FAILURE') {
      payment.status = 'FAILED';
      payment.gatewayResponse = {
        ...payment.gatewayResponse,
        failureReason: 'User simulated card decline / insufficient balance in mock gateway test',
        failedAt: new Date().toISOString(),
      };
      await payment.save();
      return {
        success: false,
        status: 'FAILED',
        payment,
        message: 'Mock Payment Declined: Simulation test failed as requested.',
      };
    }

    if (simulateStatus === 'NETWORK_ERROR') {
      payment.status = 'FAILED';
      payment.gatewayResponse = {
        ...payment.gatewayResponse,
        failureReason: 'Gateway timeout / network glitch simulation',
        failedAt: new Date().toISOString(),
      };
      await payment.save();
      return {
        success: false,
        status: 'FAILED',
        payment,
        message: 'Mock Payment Error: Gateway timeout simulation. Please retry.',
      };
    }

    // Success flow
    payment.status = 'COMPLETED';
    payment.paidAt = new Date();
    payment.gatewayResponse = {
      ...payment.gatewayResponse,
      status: 'SUCCESS',
      bankReferenceId: `BNK-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      verificationSignature: crypto.createHash('sha256').update(payment.transactionId + 'MOCK_OK').digest('hex'),
      completedAt: new Date().toISOString(),
    };
    await payment.save();

    return {
      success: true,
      status: 'COMPLETED',
      payment,
      message: 'Mock Payment successfully processed and verified.',
    };
  }

  /**
   * Shop Owner confirms receipt of Cash at counter during distribution
   */
  async confirmCashPayment({ paymentId, shopOwnerId }) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.paymentMethod !== 'CASH') {
      throw new Error('Cannot confirm cash on a non-cash payment.');
    }

    if (payment.status === 'COMPLETED') {
      return payment;
    }

    payment.status = 'COMPLETED';
    payment.paidAt = new Date();
    payment.collectedBy = shopOwnerId;
    payment.gatewayResponse = {
      ...payment.gatewayResponse,
      status: 'CASH_COLLECTED_AT_COUNTER',
      confirmedByShopOwnerId: shopOwnerId.toString(),
      confirmedAt: new Date().toISOString(),
    };

    await payment.save();
    return payment;
  }
}

const paymentService = new PaymentGatewayService();
export default paymentService;
