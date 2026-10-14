import {z} from "zod";

export const questionTypes = [
    'short_text',
    'long_text',
    'multiple_choice',
    'checkboxes',
    'dropdown',
    'linear_scale',
    'date' , 
    'time' ,
    'email' , 
    'file' ,
    'single choice' ,
    'multiple choice' ,
    'rating' , 
    'ranking' ,
    'matrix' ,
    'paragraph' ,
    'number' ,
    'url' ,
    'phone_number' ,
    'address',
    'image_choice',
] as const;

export const questionTypeSchema = z.enum(questionTypes);
export type QuestionType = z.infer<typeof questionTypeSchema>;

/** True for the types that need a list options */
export function isChoiceType(type: QuestionType): boolean {
    return type === 'single choice' || type === 'multiple choice' || type === 'checkboxes' || type === 'dropdown' || type === 'image_choice';
}


/** A choice question needs at least two options  **/
function requireOptionsForChoice(
    question: { type: QuestionType; options?: string[] },
    ctx: z.RefinementCtx,
): void {
    if (isChoiceType(question.type) && (question.options?.length ?? 0) < 2) {
        ctx.addIssue({
            code: 'custom',
            path : ['options'],
            message: 'Choice questions must have at least two options',
        });
    }
}

const questionBase = z.object({
    label: z.string().min(1 , 'Question text is required').max(200),
    type: questionTypeSchema,
    required: z.boolean(),
    options: z.array(z.string().trim().min(1).max(20)).default([]),
});

/** A question as sent when creating a form**/
export const questionInputSchema = questionBase.superRefine(
    requireOptionsForChoice,
);

/**A question as stored and returned: it also has id and position */
export const questionSchema = questionBase
    .extend({
        id: z.string().min(1),
        position: z.number().int().min(0),
    })
    .superRefine(requireOptionsForChoice);

export type QuestionInput = z.infer<typeof questionInputSchema>;
export type Question = z.infer<typeof questionSchema>;