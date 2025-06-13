"use client";

import { useAuth } from '@clerk/nextjs';

export default function PrivacySettingsPage() {
  const { userId } = useAuth();

  if (!userId) {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Settings</h1>
      
      <div className="max-w-3xl mx-auto">
      </div>
    </div>
  );
} 