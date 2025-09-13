'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';
import AuthLoading from '@/components/AuthLoading';

// Dynamically import Clerk component to avoid SSR issues
const SignIn = dynamic(() => import('@clerk/nextjs').then(mod => ({ default: mod.SignIn })), {
  ssr: false,
  loading: () => <AuthLoading message="Loading sign-in..." />
});

export default function SignInPage() {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
        <Suspense fallback={<AuthLoading message="Loading sign-in..." />}>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg border border-gray-200 dark:border-gray-700"
              }
            }}
            redirectUrl="/prompts"
          />
        </Suspense>
      </div>
    </AuthErrorBoundary>
  );
}
