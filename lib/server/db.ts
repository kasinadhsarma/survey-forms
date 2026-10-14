import {PrismaPg} from "@prisma/adapter-pg";
import { PrismaClient } from '@/generated/prisma/client';
import {getDatabaseEnv} from './env'
 
const globalForPrisma = globalThis as unknown as{
    prisma? : PrismaClient;
};

/** creates the prisma client with nodepostgres adapter of local  post gres
 * and required prisma is 7
 */
function createClient(): PrismaClient{
    const adapter = new PrismaPg({
        connectionString:getDatabaseEnv().DATABASE_URL,
    });
    return new PrismaClient({adapter});
}

/**
 * Why global This: hot reloading re-runs this module a new client each
 * time would open a new connection pool.
 */

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma;
}