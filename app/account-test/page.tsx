'use client';

import { useUser } from '@clerk/nextjs';

export default function AccountTestPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Signed In</h1>
        <p>Please sign in to access this page.</p>
        <a href="/sign-in" className="text-blue-500 hover:underline">→ Sign In</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Account Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>

      <div className="mt-6">
        <a href="/account" className="text-blue-500 hover:underline">→ Try /account again</a>
      </div>
    </div>
  );
}
