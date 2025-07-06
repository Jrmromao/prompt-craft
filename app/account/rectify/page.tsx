'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DataRectificationForm } from '@/components/privacy/DataRectificationForm';
import { Shield } from 'lucide-react';

export default function DataRectificationPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const handleUpdate = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gdpr/rectify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update information');
      }

      // Update Clerk user data
      const [firstName, ...lastNameParts] = data.name?.split(' ') || [];
      await user.update({
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Update Your Information</h1>
          <p className="text-muted-foreground">Review and update your personal information</p>
        </div>
      </div>

      <DataRectificationForm
        user={{
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || '',
          email: user.emailAddresses[0]?.emailAddress || '',
          // Add other user fields as needed
        }}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 