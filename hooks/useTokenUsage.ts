import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TokenUsage {
  currentBalance: number;
  creditCap: number;
  planType: string;
  dailyUsage: Array<{
    date: string;
    credits: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

export function useTokenUsage(userId: string) {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTokenUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/usage');
      if (!response.ok) {
        throw new Error('Failed to fetch token usage');
      }
      const data = await response.json();
      setTokenUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: 'Error',
        description: 'Failed to fetch token usage data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateTokenUsage = useCallback((newTokens: number, model: string) => {
    setTokenUsage((prev) => {
      if (!prev) return null;
      
      const newActivity = {
        id: Date.now().toString(),
        type: 'usage',
        amount: -newTokens,
        description: `Used ${newTokens} tokens with ${model}`,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        currentBalance: prev.currentBalance - newTokens,
        recentActivity: [newActivity, ...prev.recentActivity],
      };
    });
  }, []);

  useEffect(() => {
    fetchTokenUsage();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchTokenUsage, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchTokenUsage]);

  return {
    tokenUsage,
    isLoading,
    error,
    updateTokenUsage,
    refreshTokenUsage: fetchTokenUsage,
  };
} 