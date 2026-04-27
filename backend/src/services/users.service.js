import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError('Utilisateur introuvable.', 404, 'USER_NOT_FOUND');
  return user;
}

export async function updateProfile(userId, { firstName, lastName, phone }) {
  return prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, phone: phone || undefined },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
  });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new AppError('Mot de passe actuel incorrect.', 401, 'WRONG_PASSWORD');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function getAddresses(userId) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
}

export async function addAddress(userId, data) {
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.create({ data: { userId, ...data } });
}

export async function updateAddress(userId, addressId, data) {
  const addr = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!addr) throw new AppError('Adresse introuvable.', 404, 'ADDRESS_NOT_FOUND');
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.update({ where: { id: addressId }, data });
}

export async function deleteAddress(userId, addressId) {
  const addr = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!addr) throw new AppError('Adresse introuvable.', 404, 'ADDRESS_NOT_FOUND');
  await prisma.address.delete({ where: { id: addressId } });
}
