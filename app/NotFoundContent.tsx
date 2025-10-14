'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'The page you are looking for does not exist.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <Button
            onClick={() => (window.location.href = '/')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700"
          >
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
