import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  approveUser,
  createShop,
  updateShop,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Strict Admin-only middleware
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/approve', approveUser);
router.post('/shops', createShop);
router.patch('/shops/:id', updateShop);

export default router;
