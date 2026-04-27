import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, addCartItemSchema, updateCartItemSchema } from '../middleware/validate.js';

const router = express.Router();

// Toutes les routes panier nécessitent authentification
router.use(authenticate);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/items
router.post('/items', validate(addCartItemSchema), cartController.addItem);

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', validate(updateCartItemSchema), cartController.updateItem);

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', cartController.removeItem);

// DELETE /api/cart
router.delete('/', cartController.clearCart);

export default router;
