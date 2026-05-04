import express from 'express';
import { AccountController } from '../controllers/AccountController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', AccountController.createAccount);
router.get('/', AccountController.getAccounts);
router.get('/:accountId', AccountController.getAccount);

export default router;
