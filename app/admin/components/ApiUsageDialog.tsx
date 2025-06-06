import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/ui/bar-chart';

interface ApiUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UsageData {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  cacheHitRate: number;
  dailyUsage: {
    date: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }[];
}

export function ApiUsageDialog({ open, onOpenChange }: ApiUsageDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  const fetchUsageData = async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/deepseek-usage?startDate=${format(
          dateRange.from,
          'yyyy-MM-dd'
        )}&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`
      );
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      fetchUsageData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>API Usage Statistics</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex justify-end">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : usageData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Input Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.totalInputTokens.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Output Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.totalOutputTokens.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${usageData.totalCost.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(usageData.cacheHitRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={usageData.dailyUsage.map(day => ({
                    date: format(new Date(day.date), 'MMM dd'),
                    'Input Tokens': day.inputTokens,
                    'Output Tokens': day.outputTokens,
                    Cost: day.cost,
                  }))}
                  index="date"
                  categories={['Input Tokens', 'Output Tokens', 'Cost']}
                  colors={['blue', 'green', 'purple']}
                  valueFormatter={value =>
                    typeof value === 'number' ? value.toLocaleString() : value.toString()
                  }
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No usage data available for the selected date range.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
