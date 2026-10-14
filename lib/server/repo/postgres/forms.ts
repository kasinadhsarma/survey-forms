import { prisma } from '../../db';
import {
  formSchema,
  type CreateFormInput,
  type Form,
  type FormSummary,
} from '@/lib/schemas/form';

/** Lists every form with its question and response counts. */
export async function listForms(): Promise<FormSummary[]> {
  const rows = await prisma.form.findMany({
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
  const row = await prisma.form.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  if (!row) {
    return null;
  }
  // Parsing catches a bad row on the server instead of in the browser.
  return formSchema.parse({ 
    ...row, 
    createdAt: row.createdAt.toISOString() 
  });
}

/** Creates a form and its questions in one nested write. */
export async function createForm(input: CreateFormInput): Promise<Form> {
  const row = await prisma.form.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      questions: {
        create: input.questions.map((q, order) => ({ ...q, order })),
      },
    },
    include: { questions: { orderBy: { order: 'asc' } } },
  });
  return formSchema.parse({ 
    ...row, 
    createdAt: row.createdAt.toISOString() 
  });
}

/** Deletes a form; its questions and submissions go with it. Returns false if missing. */
export async function deleteForm(id: string): Promise<boolean> {
  const result = await prisma.form.deleteMany({ where: { id } });
  return result.count > 0;
}
