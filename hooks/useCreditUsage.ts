import { useState, useEffect } from 'react';

interface DailyUsage {
  date: string;
  credits: number;
}

interface CreditActivity {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface CreditUsageData {
  currentBalance: number;
  creditCap: number;
  planType: string;
  dailyUsage: DailyUsage[];
  recentActivity: CreditActivity[];
}

export function useCreditUsage() {
  const [data, setData] = useState<CreditUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreditUsage() {
      try {
        const response = await fetch('/api/credits/usage');
        if (!response.ok) {
          throw new Error('Failed to fetch credit usage');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch credit usage');
      } finally {
        setLoading(false);
      }
    }

    fetchCreditUsage();
  }, []);

  return { data, loading, error };
} 