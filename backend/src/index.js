import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { RATE_LIMITS } from './config/constants.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Routes ────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Sécurité ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting global ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.windowMs,
  max: RATE_LIMITS.API.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer dans quelques instants.' },
});
app.use('/api/', globalLimiter);

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging (désactivé en test) ───────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Marché Kora API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    paymentMode: process.env.PAYMENT_MODE || 'simulation',
  });
});

// ── Routes API ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée.' });
});

// ── Gestion centralisée des erreurs ──────────────────────────
app.use(errorHandler);

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🪘 Marché Kora API démarrée`);
  console.log(`   → URL     : http://localhost:${PORT}`);
  console.log(`   → Health  : http://localhost:${PORT}/health`);
  console.log(`   → Env     : ${process.env.NODE_ENV}`);
  console.log(`   → Payment : ${process.env.PAYMENT_MODE || 'simulation'}\n`);
});

export default app;
