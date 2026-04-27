/**
 * Gestionnaire d'erreurs centralisé Express
 * Intercepte toutes les erreurs passées via next(err)
 * Format de réponse uniforme : { success: false, message, code?, errors? }
 */
export function errorHandler(err, req, res, _next) {
  // Log structuré (sans données sensibles)
  const logContext = {
    method: req.method,
    url: req.originalUrl,
    errorName: err.name,
    errorCode: err.code,
    // NE PAS logger : req.body (peut contenir numéros de téléphone, montants)
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorHandler]', logContext, '\n', err.message);
  } else {
    // En production : log sans stack trace complète
    console.error('[ErrorHandler]', JSON.stringify(logContext));
  }

  // ── Erreurs Prisma ────────────────────────────────────────
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_ENTRY',
      message: 'Cette ressource existe déjà.',
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: 'Ressource introuvable.',
    });
  }

  // ── Erreurs de validation Zod ─────────────────────────────
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Données invalides.',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // ── Erreurs JWT ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      code: 'AUTH_ERROR',
      message: 'Token invalide ou expiré.',
    });
  }

  // ── Erreurs métier (AppError) ─────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      code: err.code || 'APP_ERROR',
      message: err.message,
    });
  }

  // ── Erreur inattendue ─────────────────────────────────────
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue.'
      : err.message,
  });
}

/**
 * Classe d'erreur applicative (erreurs métier prévisibles)
 * Utilisation : throw new AppError('Message', 400, 'CODE')
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
