import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { PAGINATION } from '../config/constants.js';

/**
 * Liste les produits avec filtres, tri et pagination
 */
export async function listProducts({ page, limit, category, minPrice, maxPrice, sort, search, featured }) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(category && { category: { slug: category } }),
    ...(featured !== undefined && { isFeatured: featured }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const orderBy = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    newest: { createdAt: 'desc' },
    rating: { rating: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

/**
 * Récupère un produit par ID ou slug avec ses reviews
 */
export async function getProduct(identifier) {
  const isUuid = /^[0-9a-f-]{36}$/.test(identifier);
  const where = isUuid ? { id: identifier } : { slug: identifier };

  const product = await prisma.product.findFirst({
    where: { ...where, isActive: true },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!product) throw new AppError('Produit introuvable.', 404, 'PRODUCT_NOT_FOUND');
  return product;
}

/**
 * Crée un nouveau produit (admin)
 */
export async function createProduct(data) {
  const slug = data.name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const slugExists = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug;

  return prisma.product.create({
    data: { ...data, slug: finalSlug },
    include: { category: true },
  });
}

/**
 * Met à jour un produit (admin)
 */
export async function updateProduct(id, data) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError('Produit introuvable.', 404, 'PRODUCT_NOT_FOUND');

  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

/**
 * Supprime un produit (soft delete via isActive)
 */
export async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError('Produit introuvable.', 404, 'PRODUCT_NOT_FOUND');

  await prisma.product.update({ where: { id }, data: { isActive: false } });
}

/**
 * Liste toutes les catégories
 */
export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
}

/**
 * Ajoute un avis sur un produit
 */
export async function addReview({ productId, userId, rating, comment }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Produit introuvable.', 404, 'PRODUCT_NOT_FOUND');

  // Vérifier si l'utilisateur a déjà laissé un avis
  const existingReview = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existingReview) {
    throw new AppError('Vous avez déjà laissé un avis sur ce produit.', 409, 'REVIEW_EXISTS');
  }

  // Créer l'avis et mettre à jour la note moyenne
  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: { productId, userId, rating, comment },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.product.update({
      where: { id: productId },
      data: {
        reviewCount: { increment: 1 },
        // Recalcul de la moyenne (approximatif — exact via agrégation)
        rating: {
          set: parseFloat(
            ((product.rating * product.reviewCount + rating) / (product.reviewCount + 1)).toFixed(1)
          ),
        },
      },
    }),
  ]);

  return review;
}
