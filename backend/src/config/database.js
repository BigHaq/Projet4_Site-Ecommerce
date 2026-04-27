import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client — Une seule instance partagée dans toute l'app
 * Évite les connexions multiples à la base de données en développement
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
