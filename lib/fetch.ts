import {BetterFetchError,createFetch,createSchema} from '@better-fetch/fetch'
import {z} from 'zod';
import { createFormSchema, formIdParamSchema,formSchema,formSummarySchema} from './schemas/form';
import { answerPayloadSchema,PageQuerySchema,submissionsPageSchema } from './schemas/submission';
import { MAX_FILE_BYTES,ALLOWED_FILE_TYPES, uploadResultSchema } from './schemas/upload';



const idResult = z.object({id:z.string()});

/**
 * Every json endpoint with its schemas a wrong url or body is type error
 */

const schema = createSchema({
    '/forms':{
        output : z.array(formSummarySchema)
    },
    '@post/forms':{
        input : createFormSchema,
        output : formSchema
    },
    '/forms/:id':{
        params : formIdParamSchema,
        output: formSchema,
    },
    '@delete/form/:id':{
        params : formIdParamSchema
    },
    '/forms/:id/submissions':{
        params:formIdParamSchema,
        query: PageQuerySchema.partial(),
        output: submissionsPageSchema,
    },
    '@post/forms/:id/submissions':{
        params : formIdParamSchema,
        input : answerPayloadSchema,
        output: idResult
    },

});

/**
 * better fetch needs an absolute base url requests only run in the browser
 */

function apiBase(): string {
    const orgin = typeof window === 'undefined'
        ?'http:localhost:3000'
        : window.location.origin;
return `${orgin}/api`
}

export const api = createFetch({
    baseURL: apiBase(),
    schema,
    throw: true
});

/**
 * Reads the server error message or fall back to generic
 * one
 */

export function getErrorMessage(error:unknown): string{
    if (error instanceof BetterFetchError){
        const body = error.error as {
            error?:{
                message?: string
            } 
        } | undefined;
        return body?.error?.message?? error.statusText??'Request failed';
    }
    return error instanceof Error ? error.message : 'Something went wrong'
}

/**
 * Plain fetch with FormData: a multipart body cannot be described by a Zod
 * input schema. The response is still parsed with a schema.
 */
export async function uploadFile(file: File): Promise<string> {
  if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error('This file type is not allowed');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('The file is larger than 700 KB');
  }
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${apiBase()}/files`, { method: 'POST', body });
  const json: unknown = await response.json();
  if (!response.ok) {
    throw new BetterFetchError(response.status, response.statusText, json);
  }
  return uploadResultSchema.parse(json).id;
}