import { z } from 'zod';

const databaseSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

const firebaseSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
});

/**
 * 2 syncing DBs: one local, another is Firebase.
 * This Firebase environmental variable function.
 */
export function getDatabaseEnv() {
  return databaseSchema.parse(process.env);
}
export function getFirebaseEnv(){
    return firebaseSchema.parse(process.env)

}


/** The sync token or undifined when none is set(sync stays closed) */
export function getSyncToken(): string| undefined{
    return process.env.SYNC_TOKEN || undefined;
}