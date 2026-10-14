import {z} from "zod";
import { fileIdSchema} from './upload';
import { isChoiceType, type Question} from './question';


/** one answer is text or a list texts for multichoice question **/
const answerValueSchema = z.union([
    z.string(),
    z.array(z.string())
]);

export const answerPayloadSchema = z.object({
    answers: z.record(z.string(), answerValueSchema)
});

export const submissionSchema =z.object({
    id : z.string().min(1),
    createdAt:z.string(),
    answers:z.record(z.string(),answerValueSchema),
});

export const PageQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const submissionsPageSchema = z.object({
    items: z.array(submissionSchema),
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
});
export type Submission = z.infer<typeof submissionSchema>;
export type SubmissionsPage = z.infer<typeof submissionsPageSchema>;

export const submissionIdSchema = z.object({
    id: z.string().min(1)

});

/** Builds the rule for one question's answer. */
function answerSchemaFor(question: Question): z.ZodType<unknown> {
  let schema: z.ZodType<unknown>;
  switch (question.type) {
    case 'number':
      schema = z.string().refine((v) => v === '' || !Number.isNaN(Number(v)), {
        message: 'Enter a number',
      });
      break;
    case 'email':
      schema = z.union([z.literal(''), z.email('Enter a valid email')]);
      break;
    case 'date':
      schema = z.union([z.literal(''), z.iso.date('Enter a valid date')]);
      break;
    case 'file':
      schema = z.union([z.literal(''), fileIdSchema]);
      break;
    case 'single_choice':
      schema = z.union([
        z.literal(''),
        z.enum(question.options as [string, ...string[]]),
      ]);
      break;
    case 'multi_choice':
      schema = z.array(z.enum(question.options as [string, ...string[]]));
      break;
    default:
      schema = z.string().max(5000);
  }
  if (!question.required) {
    return schema;
  }
  return schema.refine(
    (v) => (Array.isArray(v) ? v.length > 0 : v !== '' && v !== undefined),
    { message: 'This question is required' },
  );
}

/**
 * Builds the answer schema from a forms own questions so the browser form 
 * and the api apply exactly the same rules, answers are keyed by question id
 */

export function buildAnswerSchema (questions:Question[]){
    const shape: Record<string,z.ZodType<unknown>> = {};
    for (const question of questions){
  const base = answerSchemaFor(question);
  shape[question.id] = question.required ? base
        : isChoiceType(question.type) && question.type === 'multi_choice'
         ? base.default([])
         : base.optional();
    }
    return z.object(shape);
}