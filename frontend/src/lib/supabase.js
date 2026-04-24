import { createClient } from '@supabase/supabase-js';

// Browser-side Supabase client, used ONLY for OAuth sign-in redirects.
// The actual app session lives in our own JWT (issued by our Express
// backend), so we don't persist Supabase sessions beyond the OAuth
// callback handoff.
//
// IMPORTANT: this MUST be a true singleton. The PKCE flow stores a
// `code_verifier` in localStorage when signInWithOAuth runs, and the
// same client instance must read it back on /auth/callback. If Next.js
// route transitions (or fast-refresh) were to re-evaluate this module
// and create a second client, the second instance would not know about
// the verifier → "invalid flow state, no valid flow state found".
//
// We pin the instance on `globalThis` so every import gets the exact
// same object no matter how many times the module is re-evaluated.

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// DEBUG: confirm env vars are baked into the bundle at build time.
if (typeof window !== 'undefined') {
  console.log('[supabase.js] URL:', url);
  console.log('[supabase.js] ANON:', anon?.slice(0, 20), '(length:', anon?.length, ')');
}

const SINGLETON_KEY = '__topsell_supabase_client__';

function buildClient() {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: {
      // Explicit browser storage so the PKCE code_verifier survives the
      // Google redirect round-trip.
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-topsell-auth',
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,  // let Supabase parse the #access_token hash on /auth/callback
      flowType: 'implicit',
    },
  });
}

function getSupabase() {
  if (typeof window === 'undefined') {
    // Server render — no singleton cache, just return a one-off (or null).
    return buildClient();
  }
  if (!globalThis[SINGLETON_KEY]) {
    globalThis[SINGLETON_KEY] = buildClient();
  }
  return globalThis[SINGLETON_KEY];
}

export const supabase = getSupabase();
export const isSupabaseConfigured = Boolean(url && anon);
