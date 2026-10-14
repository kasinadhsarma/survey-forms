import type { Hono } from 'hono';
import { jsonError } from './errors';

/**
 * Answering every method not handled on path with json 405 and allow header
 * calling after real handlers for the path , becuase hono runs handlers in the order
 * they were registered
 */
export function methodNotAllowed(
    app: Hono, 
    path: string, 
    allowed: string[]) {
    const allow = [
        ...new Set([
            ...allowed, 
            'OPTIONS'
        ])]
        .join(', ');

    app.options (path, (c) =>
        jsonError(
            c,
            405,
            'method_not_allowed',
            `${c.req.method} is not allowed here. Allowed: ${allow}`,
            { Allow: allow},
        ),
    
    );
    }