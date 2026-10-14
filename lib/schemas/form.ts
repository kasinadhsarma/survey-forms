import {z} from "zod";
import {questionInputSchema,questionSchema} from './question'


export const createFormSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: z.string().trim().max(2000).optional(),
    questions : z
    .array(questionInputSchema)
    .min(1, 'At least one question is required')
    .max(50),
    
});

export const formSchema = z.object({
    id: z.string().min(1),
    title: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
    questions: z.array(questionSchema),
});

/** One row of the dashboard list. **/
export const formSummarySchema = z.object({
    id: z.string().min(1),
    title:z.string(),
    createdAt: z.string(),
    questionCount: z.number().int(),
    responseCount: z.number().int(),
});


export const formIdParamSchema = z.object({
    id: z.string().min(1)  
})

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type Form = z.infer<typeof formSchema>;
export type FormSummary = z.infer<typeof formSummarySchema>;
