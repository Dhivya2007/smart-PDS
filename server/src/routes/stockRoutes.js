import express from 'express';
import { getShopStock, restockCommodity } from '../controllers/stockController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/:shopId?', authorize('SHOP_OWNER', 'ADMIN'), getShopStock);
router.post('/restock', authorize('SHOP_OWNER', 'ADMIN'), restockCommodity);

export default router;
