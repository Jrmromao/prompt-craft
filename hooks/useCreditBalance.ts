import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CreditBalance {
  monthlyCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  usage: {
    monthlyTotal: number;
    monthlyPercentage: number;
    nextResetDate: string;
  };
}

export function useCreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/credits', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch credit balance');
        }

        const data = await response.json();
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch credit balance'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [isAuthenticated, user]);

  return { balance, isLoading, error };
} 