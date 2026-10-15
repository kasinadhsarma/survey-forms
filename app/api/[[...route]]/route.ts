import { handle } from 'hono/vercel';
import { app } from '@/lib/server/app';


//Every method is exported on purpose 
// with own empty 405 while hono answers with json 405 and allow
// there is no runtime export becuase cache components rejects it 
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);