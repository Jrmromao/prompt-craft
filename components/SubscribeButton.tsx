'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SubscribeButtonProps {
  className?: string;
  priceId?: string;
  planName?: string;
}

export function SubscribeButton({ className, priceId, planName }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the API route to create a checkout session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: priceId ? JSON.stringify({ priceId }) : undefined,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Error: ${response.status}`;
        const errorCode = data.code || 'UNKNOWN_ERROR';
        
        // Show toast for specific error types
        if (errorCode === 'VALIDATION_ERROR') {
          toast({
            title: 'Invalid Request',
            description: errorMessage,
            variant: 'destructive',
          });
        } else if (errorCode === 'CUSTOMER_ERROR') {
          toast({
            title: 'Account Error',
            description: 'There was an issue with your account. Please try again or contact support.',
            variant: 'destructive',
          });
        } else if (errorCode === 'SUBSCRIPTION_ERROR') {
          toast({
            title: 'Subscription Error',
            description: 'Unable to process subscription. Please try again or contact support.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        
        throw new Error(errorMessage);
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      // Show success toast before redirect
      toast({
        title: 'Redirecting to Checkout',
        description: `You're being redirected to complete your ${planName || 'subscription'} purchase.`,
      });

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={className || 'rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles size={18} className="mr-2" />
            Subscribe Now
          </>
        )}
      </Button>
    </div>
  );
}
