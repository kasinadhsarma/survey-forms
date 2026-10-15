
import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "../../firestore";
import { toIso } from "./forms";
import type { Form } from "@/lib/schemas/form";
import type { Submission } from "@/lib/schemas/submission";

/**
 * Writes the submission and bumps the form counter in one transaction,
 * only if the document did not already exist, so mirroring twice counts once.
 */
export async function createSubmission(
    form: Form,
    answers: Record<string, string | string[]>,
): Promise<Submission> {
    const submission: Submission = {
        id: randomUUID().replace(/-/g, ""),
        createdAt: new Date().toISOString(),
        answers,
    };
    await mirrorSubmission(form.id, submission);
    return submission;
}

export async function mirrorSubmission(
    formId: string,
    submission: Submission
) {
    const db = getDb();
    const formRef = db.collection("forms").doc(formId);
    const ref = formRef.collection("submissions").doc(submission.id);

    await db.runTransaction(async (tx) => {
        const existing = await tx.get(ref);

        if (!existing.exists) {
            tx.set(ref, submission);

            tx.set(
                formRef,
                {
                    responseCount: FieldValue.increment(1),
                },
                {
                    merge: true,
                }
            );
        }
    });
}
export async function listSubmissions(
    formId: string,
    page: number,
    limit : number,
) {
    const col = getDb().collection('forms').doc(formId).collection('submissions');
    const [totalsnap,snap] = await Promise.all([
        col.count().get(),
        col
            .orderBy('createdAt','desc')
            .offset((page - 1 ) * limit)
            .limit(limit)
            .get(),
    ]);
    const items = snap.docs.map((doc) => ({ ...doc.data(), createdAt: toIso(doc.get('createdAt')) }) as Submission);
    return {items, 
        page, 
        limit,total: totalsnap.data().count
    };

}
export async function countSubmissions(
    formId: string,

) : Promise<number>{
    const col = getDb().collection('forms').doc(formId).collection ('submissions');
    return(await col.count().get()).data().count;
}

/** Every submission of a form (used by sync). */
export async function listAllSubmissions(formId: string): Promise<Submission[]> {
    const snap = await getDb()
        .collection('forms').doc(formId).collection('submissions')
        .orderBy('createdAt', 'desc')
        .get();
    return snap.docs.map((doc) => ({ ...doc.data(), createdAt: toIso(doc.get('createdAt')) }) as Submission);
}
