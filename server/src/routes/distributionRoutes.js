import express from 'express';
import {
  verifyToken,
  confirmDistribution,
  getReceiptById,
  getDistributionHistory,
} from '../controllers/distributionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Shop owners & Admins can verify tokens and confirm distribution
router.post('/verify-token', authorize('SHOP_OWNER', 'ADMIN'), verifyToken);
router.post('/confirm', authorize('SHOP_OWNER', 'ADMIN'), confirmDistribution);

// Any authenticated user can view their history and receipts
router.get('/receipt/:receiptId', getReceiptById);
router.get('/history', getDistributionHistory);

export default router;
