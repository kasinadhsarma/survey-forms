# Survey Forms

A Google Forms clone: build a survey, share a public link, collect validated
responses and view them in a table.

## Stack

- Next.js 16 (App Router, Cache Components), Tailwind CSS v4
- react-hook-form + Zod, with `@better-fetch/fetch` as the typed client
- Hono API inside a Next.js route handler, validated with Zod
- Cloud Firestore is the primary database (forms, submissions, uploaded files)
- Prisma 7 + PostgreSQL is a local-only copy for development: it is written
  to and used as a read fallback only when `NODE_ENV` is not `production` and
  `DATABASE_URL` is set. Production needs only the Firebase variables.

The Zod schemas in `lib/schemas/` are imported by both the browser and the
API, so the same rules run in the form, in the API and before saving.

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev

# optional, local Postgres copy only:
npx prisma migrate dev
```

| Variable                                                               | Purpose                                                                                             |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | Optional. Local PostgreSQL copy for development; ignored in production                              |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Required. Firebase service account (Project settings, Service accounts). Write the key with `\n` for newlines |
| `SYNC_TOKEN`                                                           | Bearer token for the sync endpoints (local only)                                                    |

Create a Cloud Firestore database in the Firebase console first.

## Data flow

- Writes go to Firestore first. In local development the same data (same
  ids) is then copied to Postgres; a failed copy is logged, not returned.
- Reads come from Firestore; if that fails locally, they fall back to Postgres.
- `/api/sync` copies Firestore to local Postgres and removes Postgres forms
  that no longer exist in Firestore. It returns an error when local Postgres
  is disabled.
- Deleting a form deletes its Firestore submissions too.

## API

| Method      | Path                         |                                        |
| ----------- | ---------------------------- | -------------------------------------- |
| GET, POST   | `/api/forms`                 | list, create                           |
| GET, DELETE | `/api/forms/:id`             | read, delete                           |
| GET, POST   | `/api/forms/:id/submissions` | list a page, submit                    |
| POST        | `/api/files`                 | upload a file (max 700 KB)             |
| GET         | `/api/files/:id`             | download a file                        |
| GET         | `/api/sync/status`           | compare Firestore and local Postgres (token, local only) |
| POST        | `/api/sync`                  | copy Firestore to local Postgres (token) |

Every other method returns a JSON 405, and errors have the shape
`{ error: { code, message } }`.

## Checks

```bash
npx prettier --check . && npx tsc --noEmit && npx eslint . && npm run build
```

## Known limits

- There is no login: anyone with a form link can answer it, and the forms
  list and responses pages are public.
- Uploaded files live in Firestore documents, so each is limited to 700 KB.

## License

[MIT](LICENSE) (c) 2026 Kasinadh Sarma
