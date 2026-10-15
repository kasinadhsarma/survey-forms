import {Hono} from 'hono';
import { ALLOWED_FILE_TYPES,MAX_FILE_BYTES,fileIdParamSchema } from '@/lib/schemas/upload';
import { errorBody,jsonError } from '../errors';
import { methodNotAllowed } from '../methods';
import { loadFile,saveFile } from '../repo/files';
import { validate } from '../validate';

export const files = new Hono();

files.post('/', async (c) => {
  const form = await c.req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return c.json(
      errorBody('invalid_request', 'Send a multipart field "file"'),
      400,
    );
  }
  // Re-checked here because the browser check can be skipped.
  if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(file.type)) {
    return c.json(
      errorBody('invalid_file', 'This file type is not allowed'),
      400,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return c.json(
      errorBody('invalid_file', 'The file is larger than 700 KB'),
      400,
    );
  }
  return c.json({ id: await saveFile(file) }, 201);
});
methodNotAllowed(files, '/', ['POST']);

files.get('/:id', validate('param', fileIdParamSchema), async (c) => {
  const stored = await loadFile(c.req.valid('param').id);
  if (!stored) {
    return jsonError(c, 404, 'not_found', 'File not found');
  }
  // An attachment plus nosniff, so an upload is never run as a page here.
  return new Response(new Uint8Array(stored.bytes), {
    headers: {
      'Content-Type': stored.type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(stored.name)}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
methodNotAllowed(files, '/:id', ['GET']);
