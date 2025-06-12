import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UsageData {
  [feature: string]: number;
}

export function useRealtimeUsage(feature?: string) {
  const { userId } = useAuth();
  const [usage, setUsage] = useState<number | UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/usage/realtime${feature ? `?feature=${feature}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId, feature]);

  const trackUsage = useCallback(async (count: number = 1) => {
    if (!userId || !feature) return;

    try {
      const response = await fetch('/api/usage/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature, count }),
      });

      if (!response.ok) {
        throw new Error('Failed to track usage');
      }

      // Refresh usage data after tracking
      await fetchUsage();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [userId, feature, fetchUsage]);

  // Fetch initial usage data
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchUsage, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    trackUsage,
    refresh: fetchUsage,
  };
} 