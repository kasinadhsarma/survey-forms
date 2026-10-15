
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "../../firestore";
import type { Submission } from "@/lib/schemas/submission";

/**
 * Writes the submission and bumps the form counter in one transaction,
 * only if the document did not already exist, so mirroring twice counts once.
 */
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
export async function listMirroredSubmissions(
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
    const items = snap.docs.map((doc) => doc.data() as Submission);
    return {items, 
        page, 
        limit,total: totalsnap.data().count
    };

}
export async function countMirrorSubmission(
    formId: string,

) : Promise<number>{
    const col = getDb().collection('forms').doc(formId).collection ('submissions');
    return(await col.count().get()).data().count;
}