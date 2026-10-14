# Ajaia Docs

A lightweight, Google-Docs-inspired collaborative document editor. Built as a
timed take-home — scope is intentionally tight. See `ARCHITECTURE.md` for
what was cut and why.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · TipTap · Vercel Postgres (`@vercel/postgres`) · Vitest

## Mocked authentication

There is **no real auth**. A "Sign in as" dropdown in the sidebar lets you
pick one of three seeded users (Alice, Bob, Carol). The choice is stored in
`localStorage` and sent as an `x-user-id` header on every API request. All
access control is enforced server-side based on that header — see
`src/lib/access.ts`.

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision a free Vercel Postgres database** (no separate
   signup/project needed beyond your Vercel account — this uses the same
   project you deploy to):

   ```bash
   npx vercel link        # link this folder to a Vercel project
   npx vercel postgres create   # or do it from the dashboard: Storage -> Create Database -> Postgres
   npx vercel env pull .env.local   # writes POSTGRES_URL and friends locally
   ```

   (Alternatively, create the env vars manually — see `.env.local.example`.)

3. **Run the schema and seed data** against that database:

   ```bash
   psql "$env:POSTGRES_URL_NON_POOLING" -f db/schema.sql
   psql "$env:POSTGRES_URL_NON_POOLING" -f db/seed.sql
   ```

   (No `psql`? Paste the contents of both files into the Vercel dashboard's
   Storage → your database → **Query** tab and run them in order.)

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. **Run tests**

   ```bash
   npm test
   ```

## Seeded users (test accounts)

| Name  | Email            |
| ----- | ---------------- |
| Alice | alice@ajaia.dev  |
| Bob   | bob@ajaia.dev    |
| Carol | carol@ajaia.dev  |

A sample document ("Welcome to Ajaia Docs") is owned by Alice and shared
with Bob, so you can test sharing immediately.

## Supported file types for import

Only `.txt` and `.md` files, up to **1MB**. Markdown is converted to rich
text (headings, lists, etc.) via `marked`; plain text is wrapped into
paragraphs. Other file types or oversized files are rejected with a toast.

## Deploying to Vercel (free)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add a Postgres database to the project (Storage → Create Database →
   Postgres, free tier) and connect it — this sets `POSTGRES_URL` and
   friends as project env vars automatically.
4. Run `db/schema.sql` then `db/seed.sql` against that database (via the
   dashboard Query tab, or `psql` with the connection string from Storage).
5. Deploy. No build configuration changes are needed.

Vercel's hobby tier and its free Postgres tier are both sufficient for
reviewing this project at no cost.
