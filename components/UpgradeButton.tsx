'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface UpgradeButtonProps {
  priceId: string;
  planName: string;
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeButton({ priceId, planName, className, children }: UpgradeButtonProps) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planId: priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children || `Upgrade to ${planName}`
      )}
    </Button>
  );
}
