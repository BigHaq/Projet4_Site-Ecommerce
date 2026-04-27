import { z } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Middleware de validation Zod
 * Usage : validate(monSchema) en middleware de route
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Données invalides.',
          errors: err.errors.map(e => ({
            field: e.path.slice(1).join('.'), // Enlève "body."/"query." du chemin
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}

// ── Schémas Zod réutilisables ─────────────────────────────────

export const phoneE164Schema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Format E.164 requis (ex: +22967123456)');

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
  }).optional(),
});

export const uuidSchema = z.string().uuid('ID invalide.');

// ── Schémas Auth ──────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide.'),
    password: z.string().min(8, 'Mot de passe minimum 8 caractères.'),
    firstName: z.string().min(2, 'Prénom requis.').max(50),
    lastName: z.string().min(2, 'Nom requis.').max(50),
    phone: phoneE164Schema.optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide.'),
    password: z.string().min(1, 'Mot de passe requis.'),
  }),
});

// ── Schémas Produit ───────────────────────────────────────────
export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    category: z.string().optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating']).default('newest'),
    search: z.string().max(100).optional(),
    featured: z.coerce.boolean().optional(),
  }).optional(),
});

// ── Schémas Cart ──────────────────────────────────────────────
export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid('ID produit invalide.'),
    quantity: z.number().int().positive().max(99).default(1),
    variant: z.record(z.string()).optional(),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().max(99),
  }),
});

// ── Schémas Paiement ──────────────────────────────────────────
export const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('ID commande invalide.'),
    provider: z.enum(['cinetpay', 'mtn_momo', 'moov_money', 'simulation']),
    phoneNumber: phoneE164Schema,
    countryCode: z.string().length(2, 'Code pays requis (ex: BJ).').toUpperCase(),
    operator: z.enum(['MTN', 'MOOV', 'WAVE', 'ORANGE']).optional(),
  }),
});

// ── Schémas Adresse ───────────────────────────────────────────
export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    phone: phoneE164Schema,
    street: z.string().min(5).max(200),
    district: z.string().max(100).optional(),
    city: z.string().min(2).max(100),
    country: z.string().length(2).toUpperCase(),
    isDefault: z.boolean().default(false),
  }),
});

// ── Schémas Commande ──────────────────────────────────────────
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddressId: z.string().uuid('ID adresse invalide.'),
    notes: z.string().max(500).optional(),
  }),
});
