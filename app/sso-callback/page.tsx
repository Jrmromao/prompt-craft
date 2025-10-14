"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import AuthLoading from '@/components/AuthLoading';

export default function SsoCallbackPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      // User is authenticated, redirect to prompts
      console.log('OAuth successful, redirecting to prompts');
      router.push('/prompts');
    } else if (isLoaded && !user) {
      // User is not authenticated, redirect to sign-in
      console.log('OAuth failed, redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  // Handle authentication errors
  const handleAuthError = (error: any) => {
    console.error('OAuth callback error:', error);
    setError('Authentication failed. Please try again.');
    setTimeout(() => {
      router.push('/sign-in');
    }, 2000);
  };

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white p-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-red-600 dark:text-red-400">
            Authentication Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            Redirecting to sign-in page...
          </p>
        </div>
      </main>
    );
  }

  return (
    <AuthErrorBoundary>
      <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white p-4">
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center" id="sso-callback-heading">
            Signing you in securely…
          </h1>
          <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">Please wait…</span>
          </div>
          <AuthenticateWithRedirectCallback />
        </div>
      </main>
    </AuthErrorBoundary>
  );
} 