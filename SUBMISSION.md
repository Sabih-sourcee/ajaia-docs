# Submission

## Included

- Next.js 14 App Router app (`src/app`) with mocked "Sign in as" auth
- Sidebar: "My documents" / "Shared with me" + New document + Import file
- `/doc/[id]` editor: TipTap (bold, italic, underline, H1/H2, bullet/numbered
  lists), editable title with validation, debounced autosave with
  Saving…/Saved indicator
- File import (`.txt` / `.md`, ≤1MB) converted to rich text via `marked`
- Sharing: owner-only Share dialog, "Shared by X" badge for non-owners
- Server-side access control in all `/api/documents` and `/api/documents/[id]/share`
  routes (403 for non-owners/non-shared, owner-only sharing)
- Friendly toasts for failed saves, 403, 404, and bad uploads
- Vitest unit tests for access control (`src/lib/access.test.ts`) and file
  validation (`src/lib/fileValidation.test.ts`)
- `supabase/schema.sql` + `supabase/seed.sql`
- README.md, ARCHITECTURE.md, AI_WORKFLOW.md (template)

## Live URL

_TODO: paste Vercel deployment URL here_

## Video URL

_See `VIDEO_URL.txt` / TODO: paste walkthrough video URL here_

## Test accounts (mocked auth — use the "Sign in as" dropdown)

| Name  | Email           |
| ----- | --------------- |
| Alice | alice@ajaia.dev |
| Bob   | bob@ajaia.dev   |
| Carol | carol@ajaia.dev |

A seeded document ("Welcome to Ajaia Docs") is owned by Alice and shared
with Bob — useful for immediately testing the sharing / access-control flow.
