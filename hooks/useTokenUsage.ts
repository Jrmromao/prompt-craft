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
    // Don't fetch if userId is empty
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/credits/usage');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch token usage');
      }
      const data = await response.json();
      setTokenUsage(data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

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
    
    // Only set up polling if we have a userId
    if (userId) {
      const interval = setInterval(fetchTokenUsage, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchTokenUsage, userId]);

  return {
    tokenUsage,
    isLoading,
    error,
    updateTokenUsage,
    refreshTokenUsage: fetchTokenUsage,
  };
} 