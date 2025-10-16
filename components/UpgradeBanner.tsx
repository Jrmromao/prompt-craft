'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

export function UpgradeBanner() {
  const [limits, setLimits] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/plan/limits');
      if (res.ok) {
        const data = await res.json();
        setLimits(data);
      }
    } catch (error) {
      console.error('Failed to fetch limits:', error);
    }
  };

  if (!limits || dismissed) return null;

  const { usage } = limits;
  const percentUsed = usage.aiSpend.percentUsed;

  // Show warning at 80%
  if (percentUsed >= 80 && percentUsed < 100) {
    return (
      <Alert className="mb-4 border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            You've used <strong>{percentUsed.toFixed(0)}%</strong> of your monthly AI spend limit 
            (${usage.aiSpend.current.toFixed(2)} / ${usage.aiSpend.limit})
          </span>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button size="sm" variant="outline">Upgrade</Button>
            </Link>
            <button onClick={() => setDismissed(true)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show error at 100%
  if (percentUsed >= 100) {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Limit Reached:</strong> You've hit your ${usage.aiSpend.limit} monthly limit. 
            Tracking is paused until you upgrade.
          </span>
          <Link href="/pricing">
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
