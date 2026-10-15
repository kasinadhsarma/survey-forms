import { getPrisma } from '../../db';
import {
  formSchema,
  type Form,
  type FormSummary,
} from '@/lib/schemas/form';

/** Lists every form with its question and response counts. */
export async function listForms(): Promise<FormSummary[]> {
  const rows = await getPrisma().form.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true, submissions: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    questionCount: row._count.questions,
    responseCount: row._count.submissions,
  }));
}

/** Returns one form with its questions in order, or null if it is missing. */
export async function getForm(id: string): Promise<Form | null> {
  const row = await getPrisma().form.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  if (!row) {
    return null;
  }
  // The column is `order`; the API calls it `position`.
  return formSchema.parse({
    ...row,
    createdAt: row.createdAt.toISOString(),
    questions: row.questions.map(({ order, ...q }) => ({
      ...q,
      position: order,
    })),
  });
}

/** Copies a Firestore form into local Postgres under the same ids. */
export async function mirrorForm(form: Form): Promise<void> {
  const prisma = getPrisma();
  await prisma.$transaction([
    prisma.form.upsert({
      where: { id: form.id },
      create: {
        id: form.id,
        title: form.title,
        description: form.description,
        createdAt: new Date(form.createdAt),
      },
      update: { title: form.title, description: form.description },
    }),
    ...form.questions.map((q) => {
      const data = {
        label: q.label,
        type: q.type,
        required: q.required,
        options: q.options,
        order: q.position,
      };
      return prisma.question.upsert({
        where: { id: q.id },
        create: { id: q.id, formId: form.id, ...data },
        update: data,
      });
    }),
  ]);
}

/** Deletes a form; its questions and submissions go with it. Returns false if missing. */
export async function deleteForm(id: string): Promise<boolean> {
  const result = await getPrisma().form.deleteMany({ where: { id } });
  return result.count > 0;
}
