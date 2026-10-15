import { getPrisma } from '../db';
import * as firestoreForms from './firestore/forms';
import * as firestoreSubmissions from './firestore/submissions';
import * as postgresForms from './postgres/forms';
import * as postgresSubmissions from './postgres/submissions';
import { isLocalPostgresEnabled } from '../env';

function requireLocalPostgres() {
  if (!isLocalPostgresEnabled()) {
    throw new Error('Local Postgres is disabled (production or no DATABASE_URL)');
  }
}

/**
 * Compares Firestore (the source of truth) with the local Postgres copy by
 * id, not only count: counts alone say in sync when one form was deleted
 * and another added.
 */
export async function getSyncStatus() {
  requireLocalPostgres();
  const prisma = getPrisma();
  const [fsIds, pgIds] = await Promise.all([
    firestoreForms.listFormIds(),
    prisma.form.findMany({ select: { id: true } }).then((r) => r.map((f) => f.id)),
  ]);
  const missingInPostgres = fsIds.filter((id) => !pgIds.includes(id));
  const onlyInPostgres = pgIds.filter((id) => !fsIds.includes(id));
  const pgSubmissions = await prisma.submission.count();
  let fsSubmissions = 0;
  for (const id of fsIds) {
    fsSubmissions += await firestoreSubmissions.countSubmissions(id);
  }
  return {
    missingInPostgres,
    onlyInPostgres,
    submissions: { firestore: fsSubmissions, postgres: pgSubmissions },
    inSync:
      missingInPostgres.length === 0 &&
      onlyInPostgres.length === 0 &&
      pgSubmissions === fsSubmissions,
  };
}

/** Copies everything from Firestore to local Postgres. Safe to repeat. */
export async function syncAll() {
  requireLocalPostgres();
  const summaries = await firestoreForms.listForms();
  let submissionCount = 0;
  for (const summary of summaries) {
    const form = await firestoreForms.getForm(summary.id);
    if (!form) {
      continue;
    }
    await postgresForms.mirrorForm(form);
    const submissions = await firestoreSubmissions.listAllSubmissions(form.id);
    for (const submission of submissions) {
      await postgresSubmissions.mirrorSubmission(form.id, submission);
    }
    submissionCount += submissions.length;
  }
  const keep = new Set(summaries.map((s) => s.id));
  const stray = (await postgresForms.listForms())
    .map((f) => f.id)
    .filter((id) => !keep.has(id));
  for (const id of stray) {
    await postgresForms.deleteForm(id);
  }
  return {
    forms: summaries.length,
    submissions: submissionCount,
    removed: stray.length,
  };
}
