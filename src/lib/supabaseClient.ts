import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client. Not used for data access directly (the
// client always goes through our own API routes so access control is
// enforced server-side), but kept available for completeness.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url || "", anonKey || "", {
  auth: { persistSession: false },
});
