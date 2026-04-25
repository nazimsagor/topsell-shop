import { createClient } from '@supabase/supabase-js';

// Server-safe Supabase client used by metadata / sitemap / robots — no
// localStorage, no session persistence. Public anon key is fine for reading
// publicly-readable tables (products with RLS public-read policy).
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseServer =
  url && anon
    ? createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
