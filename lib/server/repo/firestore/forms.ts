import { getDb } from '../../firestore';
import { formSchema, type Form, type FormSummary } from '@/lib/schemas/form';


/**
 * Copies a form to Firestore under the same id.
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
export async function listMirroredForms(): Promise<FormSummary[]> {
  const snap = await getDb()
    .collection('forms')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title as string,
      createdAt: data.createdAt as string,
      questionCount: (data.questions as unknown[] | undefined)?.length ?? 0,
      responseCount: (data.responseCount as number | undefined) ?? 0,
    };
  });
}


/** Returns one mirrored form, or null if it is missing. */
export async function getMirroredForm(
    id: string
): Promise<Form | null> {
  const snap = await getDb().collection('forms').doc(id).get();
  if (!snap.exists) {
    return null;
  }
  // Parsing drops the extra responseCount field and catches bad documents.
  return formSchema.parse({ ...snap.data(), id: snap.id });
}


/** Removes a form's mirror. */
export async function deleteMirroredForm(id: string) {
  await getDb().collection('forms').doc(id).delete();
}
