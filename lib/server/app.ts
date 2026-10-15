import {Hono} from 'hono';
import { jsonError } from './errors';
import {files} from './routes/files';
import { forms } from './routes/forms';
import { submissions } from './routes/submissions';
import { sync } from './routes/sync';

export const app = new Hono().basePath('/api');

app.route('/forms',forms);
app.route('/forms', submissions);
app.route('files',files);
app.route('/sync',sync);

// AN unknown path returns json 404
app.notFound((
    c) => jsonError(
        c,
        404,
        'notFound',
        'No such route'
    ));


//An unexpected falure returns a generic 500 the real error only logged.

app.onError((error ,c) => {
    console.error(error);
    return jsonError(
        c,
        500,
        'internal error',
        
        'something went wrong'
    )
});