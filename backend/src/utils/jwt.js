import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

/**
 * Génère une paire de tokens JWT (access + refresh)
 */
export function generateTokenPair(payload) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
    issuer: 'marche-kora',
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
    issuer: 'marche-kora',
  });

  return { accessToken, refreshToken };
}

/**
 * Vérifie et décode un access token
 * @throws {JsonWebTokenError} si invalide
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, { issuer: 'marche-kora' });
}

/**
 * Vérifie et décode un refresh token
 * @throws {JsonWebTokenError} si invalide
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET, { issuer: 'marche-kora' });
}

/**
 * Extrait le token du header Authorization: Bearer <token>
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
