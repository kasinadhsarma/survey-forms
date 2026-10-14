// Imports: the shared Prisma client and the shapes this repo returns.
import { prisma } from '../../db';
import type { Form } from '@/lib/schemas/form';
import type { Submission } from '@/lib/schemas/submission';


// Types: answers keyed by question id, and one stored Answer row.
type Answers = Record<string, string | string[]>;
type AnswerRow = { questionId: string; value: unknown };


/** Returns what was stored so the same row can be mirrored to Firestore. */
export async function createSubmission(
  form: Form,
  answers: Answers,
): Promise<Submission> {
  // Rows to insert, one per answered question.
  const rows: {
    questionId: string;
    value: string | string[];
  }[] = [];

  // Walk the form's questions so answers to unknown ids are ignored.
  for (const question of form.questions) {
    const value = answers[question.id];
    if (value === undefined || value === '' || value.length === 0) {
      continue; // empty answers are not stored
    }

    // The Answer.value column is JSON, so strings and string arrays fit as-is.
    rows.push({ questionId: question.id, value });
  }

  // One nested create is a single transaction.
  const saved = await prisma.submission.create({
    data: { formId: form.id, answers: { create: rows } },
  });

  // Shape the result like a read, so callers treat both the same way.
  return {
    id: saved.id,
    createdAt: saved.createdAt.toISOString(),
    answers: toAnswerMap(rows),
  };
}


/** Rebuilds the question-id keyed answer map from stored rows. */
function toAnswerMap(rows: AnswerRow[]): Answers {
  const map: Answers = {};

  for (const row of rows) {
    if (typeof row.value === 'string') {
      // Single-value answers (text, number, choice, file id).
      map[row.questionId] = row.value;
    } else if (Array.isArray(row.value)) {
      // Multi-choice answers come back as a list of strings.
      map[row.questionId] = row.value.map(String);
    }
  }

  return map;
}


/** Lists one page of a form's submissions, newest first. */
export async function listSubmissions(form: Form, page: number, limit: number) {
  // Count and page query run in parallel; the count drives the pager.
  const [total, rows] = await Promise.all([
    prisma.submission.count({ where: { formId: form.id } }),
    prisma.submission.findMany({
      where: { formId: form.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, // pages are 1-based
      take: limit,
      include: { answers: true },
    }),
  ]);

  // Convert DB rows into the API shape.
  const items: Submission[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    answers: toAnswerMap(row.answers),
  }));

  return { items, page, limit, total };
}


/** Every submission of a form (used by sync). */
export async function listAllSubmissions(form: Form): Promise<Submission[]> {
  // No paging: sync needs the whole set.
  const rows = await prisma.submission.findMany({
    where: { formId: form.id },
    orderBy: { createdAt: 'desc' },
    include: { answers: true },
  });

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    answers: toAnswerMap(row.answers),
  }));
}
