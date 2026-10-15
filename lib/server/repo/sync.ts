import { prisma } from "../db";
import * as firestoreForms from './firestore/forms';
import * as firestoreSubmissions from './firestore/submissions';
import * as postgresForms from './postgres/forms';
import * as postgresSubmissions from './postgres/submissions';


/**
 * compares both db by id not only count 
 * counts alone say in sync when one form was
 * deleted and another added
 */

export async function getSyncStatus() {
  const [pgIds, fsIds] = await Promise.all([
    prisma.form
      .findMany({ select: { id: true } })
      .then((r) => r.map((f) => f.id)),
    firestoreForms.listMirroredFormIds(),
  ]);
  const missingInFirestore = pgIds.filter((id) => !fsIds.includes(id));
  const onlyInFirestore = fsIds.filter((id) => !pgIds.includes(id));
  const pgSubmissions = await prisma.submission.count();
  let fsSubmissions = 0;
  for (const id of fsIds) {
    fsSubmissions += await firestoreSubmissions.countMirroredSubmissions(id);
  }
  return {
    missingInFirestore,
    onlyInFirestore,
    submissions: { postgres: pgSubmissions, firestore: fsSubmissions },
    inSync:
      missingInFirestore.length === 0 &&
      onlyInFirestore.length === 0 &&
      pgSubmissions === fsSubmissions,
  };
}

/** Copies everything from Postgres to Firestore. Safe to repeat. */
export async function syncAll() {
  const summaries = await postgresForms.listForms();
  let submissionCount = 0;
  for (const summary of summaries) {
    const form = await postgresForms.getForm(summary.id);
    if (!form) {
      continue;
    }
    const submissions = await postgresSubmissions.listAllSubmissions(form);
    for (const submission of submissions) {
      await firestoreSubmissions.mirrorSubmission(form.id, submission);
    }
    // Why last: it sets the counter to the real number, whatever the
    // submission mirrors incremented along the way.
    await firestoreForms.mirrorForm(form, submissions.length);
    submissionCount += submissions.length;
  }
  const keep = new Set(summaries.map((s) => s.id));
  const stray = (await firestoreForms.listMirroredFormIds()).filter(
    (id) => !keep.has(id),
  );
  for (const id of stray) {
    await firestoreForms.deleteMirroredForm(id);
  }
  return {
    forms: summaries.length,
    submissions: submissionCount,
    removed: stray.length,
  };
}
