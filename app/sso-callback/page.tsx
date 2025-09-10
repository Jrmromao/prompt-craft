"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SsoCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // After OAuth callback, check authentication status
    const checkAuthAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            console.log('OAuth successful, redirecting to prompts');
            router.push('/prompts');
          } else {
            console.log('OAuth failed, redirecting to sign-in');
            router.push('/sign-in');
          }
        } else {
          console.log('Auth check failed, redirecting to sign-in');
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/sign-in');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center" id="sso-callback-heading">
          Signing you in securely…
        </h1>
        <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-400">Please wait…</span>
        </div>
      </div>
    </main>
  );
} 