import { isLocalPostgresEnabled } from '../env';

/**
 * Runs a write against the local Postgres copy. It is skipped outside local
 * development, and a failure is logged, never thrown: Firestore already has
 * the data.
 */
export async function mirrorSafely(
  task: () => Promise<unknown>,
): Promise<void> {
  if (!isLocalPostgresEnabled()) {
    return;
  }
  try {
    await task();
  } catch (error) {
    console.error('Local Postgres mirror failed', error);
  }
}

/**
 * Reads from Firestore. If that throws and local Postgres is enabled, the
 * same read runs against Postgres. Not found (null) is a real answer and is
 * not retried.
 */
export async function readWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    if (!isLocalPostgresEnabled()) {
      throw error;
    }
    console.error('Firestore read failed, using local Postgres', error);
    return fallback();
  }
}
