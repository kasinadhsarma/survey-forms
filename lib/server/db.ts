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
        connectionString:getDatabaseEnv().DATABASE_URL
    });
    return new PrismaClient({adapter});
}

/**
 * Returns one shared prisma client
 * singleton will hot this reloading in the devlopment
 * other wise open a new connection pool on every file change
 */

export function getPrisma(): PrismaClient{
    if (!globalForPrisma.prisma){
        globalForPrisma.prisma = createClient();
    }
    return globalForPrisma.prisma
}