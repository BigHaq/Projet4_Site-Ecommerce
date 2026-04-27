import express from 'express';
import rateLimit from 'express-rate-limit';
import * as paymentsController from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, initiatePaymentSchema } from '../middleware/validate.js';
import { RATE_LIMITS } from '../config/constants.js';

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: RATE_LIMITS.PAYMENT.windowMs,
  max: RATE_LIMITS.PAYMENT.max,
  message: { success: false, message: 'Trop de tentatives de paiement. Attendez 1 minute.' },
});

// POST /api/payments/initiate — Initier un paiement (authentifié)
router.post('/initiate', authenticate, paymentLimiter,
  validate(initiatePaymentSchema), paymentsController.initiatePayment);

// POST /api/payments/callback — Webhook opérateur (public — vérification interne)
router.post('/callback', paymentsController.handleCallback);
router.get('/callback', paymentsController.handleCallback); // Certains providers utilisent GET

// GET /api/payments/status/:ref — Vérifier statut (authentifié)
router.get('/status/:ref', authenticate, paymentsController.checkStatus);

// GET /api/payments/history — Historique transactions (authentifié)
router.get('/history', authenticate, paymentsController.getHistory);

export default router;
