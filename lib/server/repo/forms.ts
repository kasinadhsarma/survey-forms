import type {CreateFormInput} from '@/lib/schemas/form';
import { mirrorSafely, readWithFallback } from './dual';
import * as firestore from  './firestore/forms';
import * as postgres from './postgres/forms';

export function listForms(){
  return readWithFallback(postgres.listForms,firestore.listMirroredForms);
}
export function getForm(id:string){
  return readWithFallback(
  () => postgres.getForm(id),
  () => firestore.getMirroredForm(id),
  );

}

/**
 * postgres first then the mirror
 */
export async function  createForm(input: CreateFormInput){
  const form = await postgres.createForm(input);
  await mirrorSafely(() => firestore.mirrorForm(form));
  return form;
}

export async function deleteForm(id:string){
  const deleted = await postgres.deleteForm(id);
  if (deleted){
    await mirrorSafely(()=> firestore.deleteMirroredForm(id));
  }
  return deleted;
}