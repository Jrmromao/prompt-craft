import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface UsageData {
  date: string;
  credits: number;
}

interface UsageChartProps {
  userId: string;
  usageData?: UsageData[];
}

export function UsageChart({ userId, usageData }: UsageChartProps) {
  const [data, setData] = useState<UsageData[]>(usageData || []);
  const [loading, setLoading] = useState(!usageData);

  useEffect(() => {
    if (usageData) {
      setData(usageData);
      setLoading(false);
      return;
    }
    async function fetchUsageData() {
      try {
        const response = await fetch(`/api/user/usage?userId=${userId}`);
        const usageData = await response.json();
        setData(usageData);
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsageData();
  }, [userId, usageData]);

  if (loading) {
    return <div>Loading usage data...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Usage Statistics</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
            <YAxis />
            <Tooltip
              labelFormatter={date => format(new Date(date), 'yyyy-MM-dd')}
              formatter={(value: number) => [`${value} credits`, 'Credits Used']}
            />
            <Bar dataKey="credits" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
