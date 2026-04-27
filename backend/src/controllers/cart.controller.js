import * as cartService from '../services/cart.service.js';

export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id);
    return res.status(200).json({ success: true, data: { cart } });
  } catch (err) { next(err); }
}

export async function addItem(req, res, next) {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Article ajouté au panier.', data: { cart } });
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.itemId, req.body.quantity);
    return res.status(200).json({ success: true, data: { cart } });
  } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.itemId);
    return res.status(200).json({ success: true, message: 'Article retiré.', data: { cart } });
  } catch (err) { next(err); }
}

export async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.id);
    return res.status(200).json({ success: true, message: 'Panier vidé.' });
  } catch (err) { next(err); }
}
