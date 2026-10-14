import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client used inside API routes. Prefers the service
// role key (bypasses RLS, which we don't use anyway) and falls back to the
// anon key so the project also works with just the public env vars.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

if (!url || !key) {
  // Thrown lazily (on first import that actually runs, i.e. a request),
  // not at build time, so `next build` without env vars still succeeds.
  console.warn(
    "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
