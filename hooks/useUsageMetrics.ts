import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UsageMetrics {
  promptCount: number;
  tokenUsage: number;
  teamMemberCount: number;
  lastUsedAt: Date;
  usageByDay: { date: string; count: number }[];
  usageByFeature: { feature: string; count: number }[];
}

interface UsageLimits {
  maxPrompts: number;
  maxTokens: number;
  maxTeamMembers: number;
  features: string[];
}

interface UsageData {
  metrics: UsageMetrics;
  limits: UsageLimits;
  usagePercentages: {
    prompts: number;
    tokens: number;
    teamMembers: number;
  };
}

export function useUsageMetrics() {
  const { getToken } = useAuth();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageMetrics = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch('/api/usage', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch usage metrics');
        }

        const usageData = await response.json();
        setData(usageData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageMetrics();
  }, [getToken]);

  return { data, loading, error };
} 