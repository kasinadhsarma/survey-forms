# Survey Forms

A Google Forms clone: build a survey, share a public link, collect validated
responses and view them in a table.

## Stack

- Next.js 16 (App Router, Cache Components), Tailwind CSS v4
- react-hook-form + Zod, with `@better-fetch/fetch` as the typed client
- Hono API inside a Next.js route handler, validated with Zod
- Prisma 7 + PostgreSQL for forms, questions and answers
- Cloud Firestore as a live mirror of the data (reads fall back to it if
  Postgres is down) and as the store for uploaded files

The Zod schemas in `lib/schemas/` are imported by both the browser and the
API, so the same rules run in the form, in the API and before saving.

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values
npx prisma migrate dev    # create the tables
npm run dev
```

| Variable                                                               | Purpose                                                                                             |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                         | PostgreSQL connection string                                                                        |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase service account (Project settings, Service accounts). Write the key with `\n` for newlines |
| `SYNC_TOKEN`                                                           | Bearer token for the sync endpoints                                                                 |

Create a Cloud Firestore database in the Firebase console first.

## API

| Method      | Path                         |                                        |
| ----------- | ---------------------------- | -------------------------------------- |
| GET, POST   | `/api/forms`                 | list, create                           |
| GET, DELETE | `/api/forms/:id`             | read, delete                           |
| GET, POST   | `/api/forms/:id/submissions` | list a page, submit                    |
| POST        | `/api/files`                 | upload a file (max 700 KB)             |
| GET         | `/api/files/:id`             | download a file                        |
| GET         | `/api/sync/status`           | compare Postgres and Firestore (token) |
| POST        | `/api/sync`                  | copy Postgres to Firestore (token)     |

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
