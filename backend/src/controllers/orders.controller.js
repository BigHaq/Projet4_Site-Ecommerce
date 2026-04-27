import * as ordersService from '../services/orders.service.js';
import { validate, createOrderSchema } from '../middleware/validate.js';

export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      data: { order },
    });
  } catch (err) { next(err); }
}

export async function getUserOrders(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await ordersService.getUserOrders(req.user.id, {
      page: parseInt(page), limit: parseInt(limit),
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getOrderById(req, res, next) {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const order = await ordersService.getOrderById(req.params.id, req.user.id, isAdmin);
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) { next(err); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(req.params.id, status);
    return res.status(200).json({
      success: true,
      message: 'Statut mis à jour.',
      data: { order },
    });
  } catch (err) { next(err); }
}
