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
      if (!isSupabaseConfigured || !supabase) {
        toast.error('Google sign-in is not configured.');
        router.replace('/auth/login');
        return;
      }

      try {
        // Supabase parses the URL hash/query (detectSessionInUrl) on load.
        // But with the implicit flow the tokens sit in the URL fragment and
        // getSession() sometimes returns null on the very first tick — we
        // fall back to parsing the hash ourselves and calling setSession().
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        // If no session, try to bootstrap it from the URL hash.
        if (!data?.session) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken  = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token:  accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            if (sessionData?.session?.access_token) {
              await loginWithGoogle(sessionData.session.access_token);
              await supabase.auth.signOut();
              toast.success('Welcome!');
              const redirect = searchParams.get('redirect') || '/';
              router.replace(redirect);
              return;
            }
          }
          throw new Error('No session returned from Google');
        }

        const accessToken = data.session.access_token;
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
