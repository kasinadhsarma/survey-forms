import type { CreateFormInput } from '@/lib/schemas/form';
import { mirrorSafely, readWithFallback } from './dual';
import * as firestore from './firestore/forms';
import * as postgres from './postgres/forms';

export function listForm() {
  return readWithFallback(firestore.listForms, postgres.listForms);
}

export function getForm(id: string) {
  return readWithFallback(
    () => firestore.getForm(id),
    () => postgres.getForm(id),
  );
}

/** Firestore first, then the local Postgres copy (dev only). */
export async function createForm(input: CreateFormInput) {
  const form = await firestore.createForm(input);
  await mirrorSafely(() => postgres.mirrorForm(form));
  return form;
}

export async function deleteForm(id: string) {
  const deleted = await firestore.deleteForm(id);
  if (deleted) {
    await mirrorSafely(() => postgres.deleteForm(id));
  }
  return deleted;
}
