import {Hono } from 'hono';
import { formIdParamSchema } from '@/lib/schemas/form';
import { answerPayloadSchema,buildAnswerSchema,PageQuerySchema } from '@/lib/schemas/submission';
import {errorBody,jsonError} from'../errors'
import { methodNotAllowed } from '../methods';
import { getForm } from '../repo/forms';
import { fileExists } from '../repo/files';
import { createSubmission,listSubmissions } from '../repo/submissions';
import {validate} from '../validate'


export const submissions = new Hono();

submissions.post(
  '/:id/submissions',
  validate('param', formIdParamSchema),
  async (c) => {
    const form = await getForm(
        c.req.valid('param').id
    );
    if (!form) {
      return jsonError(
        c, 
        404, 
        'not_found', 
        'Form not found');
    }
    // A body that is not JSON becomes null and fails validation with a 400.
    const body = await c.req.json().catch(() => null);
    const shape = answerPayloadSchema.safeParse(body);
    if (!shape.success) {
      return c.json(
        errorBody(
            'invalid_request', 
            'Invalid request'
        ), 400);
    }
    // Why per request: the rules come from this form's own questions.
    const result = buildAnswerSchema(form.questions).safeParse(
      shape.data.answers,
    );
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return c.json(
        errorBody(
            'invalid_answers', 
            'Some answers are invalid', 
            issues),
        400,
      );
    }
    const answers = result.data as Record<string, string | string[]>;
    // Every file answer must be the id of a file this app stored.
    for (const question of form.questions) {
      const value = answers[question.id];
      if (
        question.type === 'file' &&
        typeof value === 'string' &&
        value !== ''
      ) {
        if (!(await fileExists(value))) {
          return c.json(
            errorBody('invalid_answers', 
                'Unknown file', [
              { 
                path: question.id, 
                message: 'Unknown file' 
            },
            ]),
            400,
          );
        }
      }
    }
    const saved = await createSubmission(
        form, 
        answers
    );
    return c.json({ id: saved.id }, 201);
  },
);

submissions.get(
  '/:id/submissions',
  validate('param', formIdParamSchema),
  validate('query', PageQuerySchema),
  async (c) => {
    const form = await getForm(c.req.valid('param').id);
    if (!form) {
      return jsonError(
        c, 
        404, 
        'not_found', 
        'Form not found');
    }
    const { page, limit } = c.req.valid('query');
    const result = await listSubmissions(
        form, 
        page, 
        limit
    );
    // File answers become download paths.
    const fileIds = new Set(
      form.questions.filter((q) => q.type === 'file').map((q) => q.id),
    );
    const items = result.items.map((item) => ({
      ...item,
      answers: Object.fromEntries(
        Object.entries(item.answers).map(([key, value]) => [
          key,
          fileIds.has(key) && typeof value === 'string' && value
            ? `/api/files/${value}`
            : value,
        ]),
      ),
    }));
    return c.json({ ...result, items });
  },
);
methodNotAllowed(
    submissions, 
    '/:id/submissions', 
    ['GET', 'POST']
);
