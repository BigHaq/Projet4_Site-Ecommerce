import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import { RATE_LIMITS } from '../config/constants.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

export default router;
