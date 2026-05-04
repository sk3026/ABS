import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
