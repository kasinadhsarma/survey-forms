// Imports: the shared Prisma client and the shapes this repo returns.
import { getPrisma } from '../../db';
import type { Form } from '@/lib/schemas/form';
import type { Submission } from '@/lib/schemas/submission';


// Types: answers keyed by question id, and one stored Answer row.
type Answers = Record<string, string | string[]>;
type AnswerRow = { questionId: string; value: unknown };


/** Copies a Firestore submission into local Postgres. Safe to repeat. */
export async function mirrorSubmission(
  formId: string,
  submission: Submission,
): Promise<void> {
  const exists = await getPrisma().submission.findUnique({
    where: { id: submission.id },
    select: { id: true },
  });
  if (exists) {
    return;
  }
  await getPrisma().submission.create({
    data: {
      id: submission.id,
      formId,
      createdAt: new Date(submission.createdAt),
      answers: {
        create: Object.entries(submission.answers).map(
          ([questionId, value]) => ({ questionId, value }),
        ),
      },
    },
  });
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
    getPrisma().submission.count({ where: { formId: form.id } }),
    getPrisma().submission.findMany({
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
