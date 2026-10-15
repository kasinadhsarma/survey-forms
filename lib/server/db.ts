import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { getDatabaseEnv } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Local-only Prisma client (Prisma 7 + node-postgres adapter).
 * Why lazy: production has no DATABASE_URL, so importing this module
 * must not create a client or throw.
 * Why globalThis: hot reloading re-runs this module, and a new client each
 * time would open a new connection pool.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({
      connectionString: getDatabaseEnv().DATABASE_URL,
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
