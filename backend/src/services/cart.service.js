import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Récupère ou crée le panier d'un utilisateur
 */
export async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, price: true,
              comparePrice: true, images: true, stock: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  return enrichCart(cart);
}

/**
 * Ajoute un article au panier
 */
export async function addItem(userId, { productId, quantity = 1, variant }) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) throw new AppError('Produit introuvable.', 404, 'PRODUCT_NOT_FOUND');
  if (product.stock < quantity) {
    throw new AppError(
      `Stock insuffisant. Disponible : ${product.stock} unité(s).`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError('Panier introuvable.', 404, 'CART_NOT_FOUND');

  // Vérifier si l'article existe déjà
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) {
      throw new AppError(
        `Stock insuffisant. Disponible : ${product.stock} unité(s).`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, variant: variant || undefined },
    });
  }

  return getOrCreateCart(userId);
}

/**
 * Met à jour la quantité d'un article
 */
export async function updateItem(userId, itemId, quantity) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError('Panier introuvable.', 404, 'CART_NOT_FOUND');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });
  if (!item) throw new AppError('Article introuvable.', 404, 'ITEM_NOT_FOUND');
  if (item.product.stock < quantity) {
    throw new AppError(`Stock insuffisant. Disponible : ${item.product.stock}.`, 400, 'INSUFFICIENT_STOCK');
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getOrCreateCart(userId);
}

/**
 * Retire un article du panier
 */
export async function removeItem(userId, itemId) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw new AppError('Panier introuvable.', 404, 'CART_NOT_FOUND');

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) throw new AppError('Article introuvable.', 404, 'ITEM_NOT_FOUND');

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getOrCreateCart(userId);
}

/**
 * Vide le panier
 */
export async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/**
 * Calcule les totaux du panier
 */
function enrichCart(cart) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { ...cart, subtotal, itemCount };
}
