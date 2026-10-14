# Architecture

## Stack choices

- **Next.js 14 App Router** — API routes and pages in one deployable unit,
  free to host on Vercel, server components where it helps, client
  components where interactivity (editor, dropdowns) is needed.
- **TipTap** — a ProseMirror wrapper that gives a real rich-text editor with
  JSON-serializable content (`editor.getJSON()`), a clean toolbar API, and
  first-party extensions for exactly what was asked (bold/italic/underline,
  headings, lists).
- **Supabase (Postgres)** — a free, hosted Postgres with a generated REST-ish
  client (`@supabase/supabase-js`). No ORM needed for three small tables.
- **Vitest** — fast, zero-config TypeScript test runner, good fit for pure
  unit tests of `/lib`.

## Data model

```
users(id uuid pk, name text, email text unique)
documents(id uuid pk, title text, content jsonb, owner_id uuid fk users,
          created_at, updated_at)
shares(document_id fk, user_id fk, primary key (document_id, user_id))
```

`content` stores TipTap's JSON document representation directly, so
formatting round-trips exactly through save/reload. Imported files are
stored temporarily as `{ type: "html-import", html }` until the editor loads
them and the first autosave converts them to proper TipTap JSON.

## Access control

Auth is mocked: the browser sends `x-user-id` (a seeded user's UUID) on every
API call. Each document-related API route:

1. Reads `x-user-id` from the request.
2. Loads the document's `owner_id` and the list of `shares.user_id` for that
   document.
3. Calls a **pure function** in `src/lib/access.ts`:
   - `canAccessDocument(userId, { ownerId, sharedUserIds })` — read/edit.
   - `canManageDocument(userId, { ownerId, sharedUserIds })` — share/delete,
     owner only.
4. Returns `403` if the check fails, `404` if the document doesn't exist.

Keeping this logic free of any Supabase import makes it trivially unit
testable (see `src/lib/access.test.ts`) and is the single source of truth
for "who can do what" — routes never duplicate the logic.

Row Level Security is intentionally **not** used: since auth is mocked at
the app layer (not Postgres), RLS would either be a no-op or would need its
own mock-auth bridge, adding complexity without real security benefit for a
take-home. This is documented as a known gap for production use.

## What was prioritized

- Correct, server-enforced access control (owner / shared / stranger) with
  tests — this was explicitly called out as a review criterion.
- A working autosave loop with clear save-state feedback.
- Content fidelity (TipTap JSON) surviving refresh.
- Clean, readable code over abstraction — no repository layer, no state
  management library, no custom hooks beyond what's needed.

## What was deliberately cut (and why)

- **Realtime collaboration (multi-cursor, live co-editing)** — needs a
  websocket/CRDT layer (e.g. Yjs + a provider); large scope increase for a
  timed exercise, and not required by the brief.
- **Comments** — a separate data model and UI surface; not core to "can two
  people edit and share a document."
- **Version history** — would need either append-only snapshots or a diff
  store; valuable but orthogonal to the core CRUD + sharing flow being
  evaluated here.
- **.docx import** — needs a real parser (e.g. mammoth.js) and more complex
  HTML normalization than `.txt`/`.md`; the brief only asked for text/markdown.
- **Real authentication** — explicitly out of scope per the brief; mocked
  auth via header is clearly labeled everywhere (UI + README).

## Next 2–4 hours, if continuing

1. Debounced "presence" indicator (who else is viewing, via Supabase
   Realtime broadcast) — cheap step toward real collaboration.
2. Optimistic UI for title rename and share add/remove (currently
   request-then-refresh).
3. Document-level loading/error skeletons instead of plain text states.
4. Basic rate limiting / input size caps on the PATCH content endpoint.
5. Soft-delete + "Recently deleted" instead of hard delete.
6. E2E smoke test (Playwright) covering sign-in-as → create → edit →
   share → sign in as sharee → edit.
