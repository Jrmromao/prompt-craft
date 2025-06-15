import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CreditUsage {
  monthlyUsed: number;
  monthlyTotal: number;
  monthlyPercentage: number;
  purchasedTotal: number;
  nextResetDate: string;
}

interface CreditBalance {
  monthlyCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  lastMonthlyReset: string | null;
  planType: string;
  role: string;
  usage: CreditUsage;
}

interface UseCreditBalanceReturn {
  balance: CreditBalance | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasEnoughCredits: (required: number) => boolean;
  getMissingCredits: (required: number) => number;
}

export function useCreditBalance(): UseCreditBalanceReturn {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const {
    data,
    isLoading,
    refetch: queryRefetch,
  } = useQuery<CreditBalance>({
    queryKey: ['creditBalance'],
    queryFn: async () => {
      const response = await fetch('/api/credits/balance');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch credit balance');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  const refetch = useCallback(async () => {
    try {
      await queryRefetch();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refetch credit balance'));
    }
  }, [queryRefetch]);

  const hasEnoughCredits = useCallback(
    (required: number): boolean => {
      if (!data) return false;
      return data.totalCredits >= required;
    },
    [data]
  );

  const getMissingCredits = useCallback(
    (required: number): number => {
      if (!data) return required;
      return Math.max(0, required - data.totalCredits);
    },
    [data]
  );

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CREDIT_UPDATE') {
        // Invalidate and refetch credit balance
        queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
      }
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return {
    balance: data || null,
    isLoading,
    error,
    refetch,
    hasEnoughCredits,
    getMissingCredits,
  };
} 