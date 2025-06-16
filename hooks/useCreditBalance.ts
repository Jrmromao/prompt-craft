import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

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
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/user/credits', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [getToken]);

  return { balance, isLoading, error };
} 