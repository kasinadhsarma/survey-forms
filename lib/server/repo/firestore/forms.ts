import { randomUUID } from 'crypto';
import { getDb } from '../../firestore';
import {
  formSchema,
  type CreateFormInput,
  type Form,
  type FormSummary,
} from '@/lib/schemas/form';


/** Firestore Timestamps (e.g. docs made in the console) become ISO strings. */
export function toIso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate(): Date }).toDate().toISOString();
  }
  return new Date(0).toISOString();
}

const newId = () => randomUUID().replace(/-/g, '');

/** Creates a form with generated ids and a zero response counter. */
export async function createForm(input: CreateFormInput): Promise<Form> {
  const form: Form = {
    id: newId(),
    title: input.title,
    description: input.description ?? null,
    createdAt: new Date().toISOString(),
    questions: input.questions.map((q, position) => ({
      ...q,
      id: newId(),
      position,
    })),
  };
  await mirrorForm(form, 0);
  return form;
}

/**
 * Writes a form to Firestore under the same id.
 * Keeps the response counter.
 */
export async function mirrorForm(
    form: Form, 
    responseCount?: number
) {
  const ref = getDb().collection('forms').doc(form.id);
  const data: Record<string, unknown> = { ...form };

  // Only overwrite the counter when the caller knows the real value.
  if (responseCount !== undefined) {
    data.responseCount = responseCount;
  }
  await ref.set(data, { merge: true });

  if (responseCount === undefined) {
    // Set the counter only when the document has none yet.
    await getDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.get('responseCount') === undefined) {
        tx.update(ref, { responseCount: 0 });
      }
    });
  }
}


/** Lists mirrored forms, newest first. */
export async function listForms(): Promise<FormSummary[]> {
  const snap = await getDb()
    .collection('forms')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title as string,
      createdAt: toIso(data.createdAt),
      questionCount: (data.questions as unknown[] | undefined)?.length ?? 0,
      responseCount: (data.responseCount as number | undefined) ?? 0,
    };
  });
}


/** Lists the ids of all mirrored forms. */
export async function listFormIds(): Promise<string[]> {
  const snap = await getDb().collection('forms').select().get();
  return snap.docs.map((doc) => doc.id);
}


/** Returns one mirrored form, or null if it is missing. */
export async function getForm(
    id: string
): Promise<Form | null> {
  const snap = await getDb().collection('forms').doc(id).get();
  if (!snap.exists) {
    return null;
  }
  // Parsing drops the extra responseCount field and catches bad documents.
  return formSchema.parse({
    ...snap.data(),
    id: snap.id,
    description: snap.get('description') ?? null,
    createdAt: toIso(snap.get('createdAt')),
  });
}


/** Deletes a form and its submissions. Returns false if it is missing. */
export async function deleteForm(id: string): Promise<boolean> {
  const ref = getDb().collection('forms').doc(id);
  if (!(await ref.get()).exists) {
    return false;
  }
  await getDb().recursiveDelete(ref);
  return true;
}
