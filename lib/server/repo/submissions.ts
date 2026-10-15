import type { Form } from '@/lib/schemas/form';
import { mirrorSafely, readWithFallback } from './dual';
import * as firestore from './firestore/submissions';
import * as postgres from './postgres/submissions';

/** Firestore first, then the local Postgres copy (dev only). */
export async function createSubmission(
  form: Form,
  answers: Record<string, string | string[]>,
) {
  const submission = await firestore.createSubmission(form, answers);
  await mirrorSafely(() => postgres.mirrorSubmission(form.id, submission));
  return submission;
}

export function listSubmissions(form: Form, page: number, limit: number) {
  return readWithFallback(
    () => firestore.listSubmissions(form.id, page, limit),
    () => postgres.listSubmissions(form, page, limit),
  );
}
