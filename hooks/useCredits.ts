import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PlanType, Period } from '@/utils/constants';

interface CreditState {
  used: number;
  total: number;
  percentage: number;
  periodEnd: Date;
  isPro: boolean;
}

export function useCredits() {
  const { userId } = useAuth();
  const [creditState, setCreditState] = useState<CreditState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditState = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/credits/status');
      if (!response.ok) {
        throw new Error('Failed to fetch credit status');
      }
      const data = await response.json();
      setCreditState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleUpgrade = useCallback(async (plan: PlanType, period: Period) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, period }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }

      // Refresh credit state after upgrade
      await fetchCreditState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchCreditState]);

  const handleTopUp = useCallback(async (amount: number) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/credits/top-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to top up credits');
      }

      // Refresh credit state after top-up
      await fetchCreditState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, fetchCreditState]);

  // Fetch initial credit state
  useEffect(() => {
    fetchCreditState();
  }, [fetchCreditState]);

  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(fetchCreditState, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchCreditState]);

  return {
    creditState,
    isLoading,
    error,
    refresh: fetchCreditState,
    upgrade: handleUpgrade,
    topUp: handleTopUp,
  };
} 