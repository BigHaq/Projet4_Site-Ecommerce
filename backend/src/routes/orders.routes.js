import express from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, createOrderSchema } from '../middleware/validate.js';
import { z } from 'zod';
import { ORDER_STATUS } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// POST /api/orders
router.post('/', validate(createOrderSchema), ordersController.createOrder);

// GET /api/orders
router.get('/', ordersController.getUserOrders);

// GET /api/orders/:id
router.get('/:id', ordersController.getOrderById);

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', requireAdmin,
  validate(z.object({
    body: z.object({
      status: z.enum(Object.values(ORDER_STATUS)),
    }),
  })),
  ordersController.updateOrderStatus
);

export default router;
