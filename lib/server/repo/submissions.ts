import type{Form} from '@/lib/schemas/form';
import { mirrorSafely,readWithFallback } from './dual';
import * as firestore from  './firestore/submissions';
import * as postgres from './postgres/submissions'


/**
 * postgres first then the mirror
 */

export async function createSubmission(
    form : Form,
    answers : Record<string,string | string[]>,
){
    const submission = await postgres.createSubmission(form,answers);
    await mirrorSafely(()=> firestore.mirrorSubmission(form.id,submission));
    return submission
}

export function listSubmissions(form:Form,page:number,limit:number){
    return readWithFallback(
        () => postgres.listSubmissions(form, page, limit),
        () => firestore.listMirroredSubmissions(form.id, page, limit),
    );
}