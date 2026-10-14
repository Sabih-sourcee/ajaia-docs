# Ajaia Docs

A lightweight, Google-Docs-inspired collaborative document editor. Built as a
timed take-home — scope is intentionally tight. See `ARCHITECTURE.md` for
what was cut and why.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · TipTap · Supabase (Postgres) · Vitest

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

2. **Create a free Supabase project** at [supabase.com](https://supabase.com).

3. **Run the schema and seed data** — open the Supabase SQL editor and run,
   in order:
   - `supabase/schema.sql`
   - `supabase/seed.sql`

4. **Set environment variables** — copy `.env.local.example` to `.env.local`
   and fill in your Supabase project values (Project Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Row Level Security is left off (access is checked in API route code), so
   the anon key also works if you don't want to use the service role key.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

6. **Run tests**

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
3. Add the same three environment variables from step 4 above in the
   Vercel project settings (Environment Variables).
4. Deploy. No build configuration changes are needed.

Supabase's free tier and Vercel's hobby tier are both sufficient for
reviewing this project at no cost.
