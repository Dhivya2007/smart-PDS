import express from 'express';
import {
  getPaymentByBookingId,
  simulateMockOnlinePayment,
  confirmCashPayment,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/booking/:bookingId', getPaymentByBookingId);
router.post('/simulate-online', simulateMockOnlinePayment);
router.post('/confirm-cash', authorize('SHOP_OWNER', 'ADMIN'), confirmCashPayment);

export default router;
