"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Something went wrong!</h2>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. Please try again or contact support if the problem persists.
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Go Home
            </Button>
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 