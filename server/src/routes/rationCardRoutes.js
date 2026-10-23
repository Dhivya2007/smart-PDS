import express from 'express';
import { verifyCard, linkCardToUser, getMyCard } from '../controllers/rationCardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public/semi-public verification for registration or quick check
router.post('/verify', verifyCard);

// Authenticated routes
router.use(authenticate);
router.post('/link', linkCardToUser);
router.get('/my-card', getMyCard);

export default router;
