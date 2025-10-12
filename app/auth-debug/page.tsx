'use client';

import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { userId, sessionId } = useAuth();
  const { signOut } = useClerk();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testApiAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setApiResponse({ status: response.status, data });
    } catch (error) {
      setApiResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  useEffect(() => {
    if (mounted && isLoaded && isSignedIn) {
      testApiAuth();
    }
  }, [mounted, isLoaded, isSignedIn]);

  if (!mounted || !isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* Clerk Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clerk Authentication</h2>
          <div className="space-y-2">
            <p><strong>Is Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Is Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User ID:</strong> {userId || 'None'}</p>
            <p><strong>Session ID:</strong> {sessionId || 'None'}</p>
            {user && (
              <>
                <p><strong>User Email:</strong> {user.emailAddresses[0]?.emailAddress || 'None'}</p>
                <p><strong>User Name:</strong> {user.firstName} {user.lastName}</p>
              </>
            )}
          </div>
          
          {!isSignedIn && (
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <p className="text-yellow-800">❌ Not signed in. Please sign in first.</p>
              <a href="/sign-in" className="text-blue-500 hover:underline">→ Go to Sign In</a>
            </div>
          )}

          {isSignedIn && (
            <div className="mt-4 space-x-2">
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out & Refresh
              </button>
            </div>
          )}
        </div>

        {/* API Response */}
        {isSignedIn && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Auth Response</h2>
            <button 
              onClick={testApiAuth} 
              disabled={loading}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Auth'}
            </button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Navigation Test */}
        {isSignedIn && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <div className="space-y-2">
              <a href="/prompts" className="block text-blue-500 hover:underline">→ Go to /prompts</a>
              <a href="/dashboard" className="block text-blue-500 hover:underline">→ Go to /dashboard</a>
              <a href="/account" className="block text-blue-500 hover:underline">→ Go to /account</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
