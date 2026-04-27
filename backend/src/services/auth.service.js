import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { USER_ROLES } from '../config/constants.js';

const SALT_ROUNDS = 12;

/**
 * Inscrit un nouvel utilisateur
 */
export async function register({ email, password, firstName, lastName, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Un compte existe déjà avec cet email.', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      role: USER_ROLES.CUSTOMER,
      cart: { create: {} }, // Créer le panier en même temps
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, role: true, createdAt: true,
    },
  });

  const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });

  // Persister le refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return { user, ...tokens };
}

/**
 * Connecte un utilisateur existant
 */
export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email ou mot de passe incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Email ou mot de passe incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.upsert({
    where: { token: tokens.refreshToken },
    create: { token: tokens.refreshToken, userId: user.id, expiresAt },
    update: { expiresAt },
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

/**
 * Rafraîchit l'access token via refresh token
 */
export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Refresh token invalide ou expiré.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Session expirée. Veuillez vous reconnecter.', 401, 'SESSION_EXPIRED');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError('Utilisateur introuvable.', 404, 'USER_NOT_FOUND');
  }

  // Rotation du refresh token
  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return tokens;
}

/**
 * Déconnecte (révoque le refresh token)
 */
export async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
}
