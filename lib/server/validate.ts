import { zValidator } from '@hono/zod-validator';
import type { ZodType } from 'zod';
import { errorBody } from './errors';

type Target = 'json' | 'param' | 'query';

/**
 * zValidator with the same 400 body everywhere, listing every issue.
 */
export function validate<T extends ZodType>(target: Target, schema: T) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return c.json(errorBody('invalid_request', 'Invalid request', issues), 400);
    }
  });
}
