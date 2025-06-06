'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Something went wrong!</h2>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Please try again or contact support if the problem
              persists.
            </p>
          </div>
          <div className="mt-4 flex gap-4">
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Go Home
            </Button>
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
