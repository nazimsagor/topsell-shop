import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client, used ONLY for OAuth sign-in redirects.
// The actual app session lives in our own JWT (issued by our Express
// backend), so we don't persist Supabase sessions in localStorage beyond
// the OAuth callback handoff.
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anon
  ? createClient(url, anon, {
      auth: {
        persistSession: true,       // keeps the PKCE code_verifier across the redirect
        autoRefreshToken: false,
        detectSessionInUrl: false,  // we handle the exchange manually in /auth/callback
        flowType: 'pkce',
      },
    })
  : null;

export const isSupabaseConfigured = Boolean(url && anon);
