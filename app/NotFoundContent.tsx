'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'The page you are looking for does not exist.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
} 