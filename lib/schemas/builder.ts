import {z} from 'zod';
import { createFormSchema,type CreateFormInput } from './form';
import { isChoiceType,questionTypeSchema } from './question';

/**
 * client  is now react hook form fieild arrays need objects,
 * so options are value here and become plain strings in api payload
 */

export const builderFormSchema = z.object({
    title: z.string().trim().min(1,'Title is required'),
    description: z.string().optional(),
    questions:z
    .array(
        z.object({
            label:z.string().trim().min(1,'Question text is required'),
            type:questionTypeSchema,
            required:z.boolean(),
            options:z.array(z.object({value:z.string()})),
        }),
    )
    .min(1,'Add at least one question'),
});

export type BuilderForm = z.infer<typeof builderFormSchema>;

/**
 * converts the builder state to the payload the api accepts
 */
export function  toCreateFormPayload(values:BuilderForm) : CreateFormInput{
    return createFormSchema.parse({
        title: values.title,
        description : values.description|| undefined,
        questions: values.questions.map((q)=>({
            label: q.label,
            type:q.type,
            required: q.required,
            options: isChoiceType(q.type)
            ?q.options.map((o)=>o.value)
            .filter((v)=>v.trim()!=='')
            : [],
        })),
    });
}