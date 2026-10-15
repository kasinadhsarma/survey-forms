import {Hono} from 'hono';
import { getSyncToken } from '../env';
import { jsonError } from '../errors';
import { methodNotAllowed } from '../methods';
import { getSyncStatus,syncAll } from '../repo/sync';

export const sync = new Hono();
// these routes can rewrite a whole database and reveal counts,
// so with no token configured they stay closed
sync.use('*', async (c, next) => {
    const token = getSyncToken();
    if (!token || c.req.header('authorization') !== `Bearer ${token}`) {
        return jsonError(
            c,
            401,
            'unauthorized',
            'missing or wrong token'
        );
    }
    await next();
});

sync.get(
    '/status',
    async (c) => c.json(await getSyncStatus())
);
methodNotAllowed(sync,
    '/status',
    ['GET']
);

sync.post('/', async (c) => c.json(await syncAll()));
methodNotAllowed(sync, '/', ['POST']);
