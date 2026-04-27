import express from 'express';
import * as productsController from '../controllers/products.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate, productQuerySchema } from '../middleware/validate.js';
import { z } from 'zod';

const router = express.Router();

// GET /api/products — Liste publique
router.get('/', validate(productQuerySchema), productsController.listProducts);

// GET /api/products/categories — Liste des catégories
router.get('/categories', productsController.listCategories);

// GET /api/products/:id — Détail produit (ID ou slug)
router.get('/:id', productsController.getProduct);

// POST /api/products — Créer (admin)
router.post('/', authenticate, requireAdmin, productsController.createProduct);

// PUT /api/products/:id — Modifier (admin)
router.put('/:id', authenticate, requireAdmin, productsController.updateProduct);

// DELETE /api/products/:id — Supprimer (admin)
router.delete('/:id', authenticate, requireAdmin, productsController.deleteProduct);

// POST /api/products/:id/reviews — Ajouter un avis (client connecté)
router.post('/:id/reviews', authenticate,
  validate(z.object({
    body: z.object({
      rating: z.coerce.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
    }),
  })),
  productsController.addReview
);

export default router;
