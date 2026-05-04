import express from 'express';
import { TransactionController } from '../controllers/TransactionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/transfer', TransactionController.transfer);
router.get('/:accountId/balance', TransactionController.getBalance);
router.get('/:accountId/history', TransactionController.getHistory);

export default router;
