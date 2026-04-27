import * as productsService from '../services/products.service.js';
import { PAGINATION } from '../config/constants.js';

export async function listProducts(req, res, next) {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      minPrice,
      maxPrice,
      sort = 'newest',
      search,
      featured,
    } = req.query;

    const result = await productsService.listProducts({
      page: parseInt(page),
      limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
      category,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sort,
      search,
      featured: featured !== undefined ? featured === 'true' : undefined,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await productsService.getProduct(req.params.id);
    return res.status(200).json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productsService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productsService.updateProduct(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Produit mis à jour.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productsService.deleteProduct(req.params.id);
    return res.status(200).json({ success: true, message: 'Produit supprimé.' });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await productsService.listCategories();
    return res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function addReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const review = await productsService.addReview({
      productId: req.params.id,
      userId: req.user.id,
      rating: parseInt(rating),
      comment,
    });
    return res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès.',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
}
