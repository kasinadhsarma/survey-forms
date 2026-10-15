import {Hono} from 'hono';
import { createFormSchema, formIdParamSchema } from '@/lib/schemas/form';
import { jsonError } from '../errors';
import { methodNotAllowed } from '../methods';
import { createForm,deleteForm,getForm,listForm } from '../repo/forms';
import {validate} from '../validate'

export const forms = new Hono();

forms.get('/',async(c)=> c.json(await listForm()));

forms.post('/',validate('json',createFormSchema),async(c)=>{
    const form = await createForm(c.req.valid('json'));
    return c.json(form,201);
});

methodNotAllowed(forms, '/',['GET','POST']);

forms.get('/:id',validate('param',formIdParamSchema),async(c)=>{
    const form = await getForm(c.req.valid('param').id);
    return form
        ? c.json(form)
        : jsonError(c,404,'not_found','Form not Found');
});

forms.delete('/:id',validate('param',formIdParamSchema),async(c)=>{
    const deleted = await deleteForm(c.req.valid('param').id);
    return deleted
        ? c.body(null,204)
        : jsonError(c,404,'not_found','Form not Found');
});
methodNotAllowed(forms, '/:id', ['GET','DELETE']);