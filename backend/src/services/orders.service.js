import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { ORDER_STATUS } from '../config/constants.js';
import { clearCart } from './cart.service.js';

const SHIPPING_FEE = 1500; // 1500 FCFA de frais de livraison standard

/**
 * Crée une commande depuis le panier actif
 */
export async function createOrder(userId, { shippingAddressId, notes }) {
  // Récupérer le panier avec les produits
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Votre panier est vide.', 400, 'EMPTY_CART');
  }

  // Vérifier l'adresse de livraison
  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });
  if (!address) {
    throw new AppError('Adresse de livraison introuvable.', 404, 'ADDRESS_NOT_FOUND');
  }

  // Vérifier les stocks et calculer le total
  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new AppError(
        `Le produit "${item.product.name}" n'est plus disponible.`,
        400,
        'PRODUCT_UNAVAILABLE'
      );
    }
    if (item.product.stock < item.quantity) {
      throw new AppError(
        `Stock insuffisant pour "${item.product.name}". Disponible : ${item.product.stock}.`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalAmount = subtotal + SHIPPING_FEE;

  // Transaction Prisma : créer la commande + décrémenter les stocks + vider le panier
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        shippingAddressId,
        status: ORDER_STATUS.PENDING,
        subtotal,
        shippingFee: SHIPPING_FEE,
        totalAmount,
        notes: notes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            variant: item.variant || undefined,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        shippingAddress: true,
      },
    });

    // Décrémenter les stocks
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Vider le panier
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
}

/**
 * Historique des commandes d'un utilisateur
 */
export async function getUserOrders(userId, { page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        items: {
          include: { product: { select: { name: true, images: true, slug: true } } },
        },
        transactions: {
          select: { status: true, provider: true, confirmedAt: true },
          orderBy: { initiatedAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Détail d'une commande (vérification propriétaire)
 */
export async function getOrderById(orderId, userId, isAdmin = false) {
  const where = isAdmin ? { id: orderId } : { id: orderId, userId };

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: { product: { select: { name: true, images: true, slug: true, price: true } } },
      },
      shippingAddress: true,
      transactions: {
        orderBy: { initiatedAt: 'desc' },
        select: {
          id: true, provider: true, status: true, amount: true,
          currency: true, reference: true, initiatedAt: true, confirmedAt: true,
        },
      },
    },
  });

  if (!order) throw new AppError('Commande introuvable.', 404, 'ORDER_NOT_FOUND');
  return order;
}

/**
 * Met à jour le statut d'une commande (admin)
 */
export async function updateOrderStatus(orderId, status) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Commande introuvable.', 404, 'ORDER_NOT_FOUND');

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
