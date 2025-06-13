"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SsoCallbackPage() {
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
        <AuthenticateWithRedirectCallback />
      </div>
    </main>
  );
} 