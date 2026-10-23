import express from 'express';
import { getAllShops, getShopById, getShopAvailableSlots } from '../controllers/shopController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllShops);
router.get('/:id', getShopById);
router.get('/:shopId/slots', authenticate, getShopAvailableSlots);

export default router;
