/**
 * Builds the json body every error response uses so we can always
 * read error.message and error.code in the same place
 */
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * This is api error body
 * error code is string
 * message is also string 
 *  issues are unknown 
 */
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    issues?: unknown;
  };
};

/**
 * 
 * The one error body shape used by every endpoint
 * 
 */

export function errorBody(
  code: string,
  message: string,
  issues?: unknown,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(issues === undefined ? {} : { issues }),
    },
  };
}

/**
 *  sends the error body with a status optional headers
 */
export function jsonError(
  c: Context,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  headers?: Record<string, string>,
  issues?: unknown,
) {
  return c.json(errorBody(code, message, issues), status, headers);
}