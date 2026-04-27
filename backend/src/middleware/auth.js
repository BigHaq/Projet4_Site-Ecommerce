import { verifyAccessToken, extractBearerToken } from '../utils/jwt.js';
import { USER_ROLES } from '../config/constants.js';

/**
 * Middleware d'authentification JWT
 * Vérifie le token Bearer dans le header Authorization
 * Attache req.user = { id, email, role }
 */
export function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise. Veuillez vous connecter.',
      });
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session expirée. Veuillez vous reconnecter.',
      });
    }
    return res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Token invalide.',
    });
  }
}

/**
 * Middleware de contrôle de rôle
 * Usage : requireRole(USER_ROLES.ADMIN)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Vous n'avez pas les droits nécessaires.",
      });
    }

    next();
  };
}

/**
 * Middleware optionnel : attache req.user si token présent, sinon continue
 */
export function optionalAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    }
  } catch {
    // Token invalide ou absent — on continue sans user
  }
  next();
}

// Alias pratiques
export const requireAdmin = requireRole(USER_ROLES.ADMIN);
export const requireCustomer = requireRole(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN);
