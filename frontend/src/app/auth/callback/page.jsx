'use client';
import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import useAuthStore from '@/store/useAuthStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // DEBUG: verify env vars are reaching the client bundle.
      console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));
      console.log('isSupabaseConfigured:', isSupabaseConfigured);

      if (!isSupabaseConfigured || !supabase) {
        toast.error('Google sign-in is not configured.');
        router.replace('/auth/login');
        return;
      }

      try {
        // Implicit flow — Supabase parses the #access_token hash itself
        // (detectSessionInUrl:true). Give it 500ms to finish, then read
        // the session.
        await new Promise((r) => setTimeout(r, 500));

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const accessToken = data?.session?.access_token;
        if (!accessToken) throw new Error('No session returned from Google');

        await loginWithGoogle(accessToken);

        // Clear the Supabase session — we only used it to get the token.
        // Our own app JWT (in localStorage) is what keeps the user logged in.
        await supabase.auth.signOut();

        toast.success('Welcome!');
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } catch (err) {
        console.error('[auth/callback]', err);
        toast.error(err.response?.data?.error || err.message || 'Google sign-in failed');
        router.replace('/auth/login');
      }
    })();
  }, [router, searchParams, loginWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
