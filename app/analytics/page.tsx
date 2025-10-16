'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, Activity, Clock, TrendingUp, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { DateRange } from 'react-day-picker';

interface AnalyticsData {
  dailyData: Array<{ date: string; runs: number; cost: number; tokens: number }>;
  byModel: Array<{ model: string; runs: number; cost: number }>;
  byProvider: Array<{ provider: string; runs: number; cost: number }>;
  totalRuns: number;
  totalCost: number;
  avgLatency: number;
  successRate: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [customRange, setCustomRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const url = customRange && dateRange?.from && dateRange?.to
      ? `/api/analytics/overview?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      : `/api/analytics/overview?days=${days}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch analytics:', err);
        setLoading(false);
      });
  }, [days, customRange, dateRange]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-4 bg-gray-200 rounded w-24"></div></CardHeader>
              <CardContent><div className="h-8 bg-gray-200 rounded w-16"></div></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.totalRuns === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your AI costs and optimize your prompts</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => { setDays(d); setCustomRange(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  days === d && !customRange
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              onClick={() => setCustomRange(!customRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                customRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {customRange && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      'Pick a date range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data for Selected Period</h2>
            <p className="text-gray-600 mb-6">
              Try selecting a different date range or start tracking your AI costs
            </p>
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your AI costs and optimize your prompts</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => { setDays(d); setCustomRange(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                days === d && !customRange
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => setCustomRange(!customRange)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              customRange
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {customRange && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    'Pick a date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Runs"
          value={data?.totalRuns?.toLocaleString() || '0'}
          icon={<Activity className="w-4 h-4 text-blue-600" />}
          subtitle={`Last ${days} days`}
        />
        <StatCard
          title="Total Cost"
          value={`$${data?.totalCost?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          subtitle={`Last ${days} days`}
        />
        <StatCard
          title="Avg Latency"
          value={`${Math.round(data?.avgLatency || 0)}ms`}
          icon={<Clock className="w-4 h-4 text-purple-600" />}
          subtitle="Response time"
        />
        <StatCard
          title="Success Rate"
          value={`${data?.successRate?.toFixed(1) || '0.0'}%`}
          icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
          subtitle={`${data?.totalRuns || 0} total`}
        />
      </div>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Usage (Last {Math.min(days, 14)} Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {(data?.dailyData || []).slice(-Math.min(days, 14)).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 bg-blue-600 rounded"
                      style={{ width: `${(day.runs / Math.max(...(data?.dailyData || []).map(d => d.runs))) * 100}%` }}
                    ></div>
                    <span className="text-sm font-medium">{day.runs} runs</span>
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium">${day.cost.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Model */}
      <Card>
        <CardHeader>
          <CardTitle>By Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(data?.byModel || []).map((item) => (
              <div key={item.model} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.model}</span>
                    <span className="text-sm text-gray-500">{item.runs} runs</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${(item.cost / (data?.totalCost || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="font-semibold">${item.cost.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{((item.cost / (data?.totalCost || 1)) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Provider */}
      <Card>
        <CardHeader>
          <CardTitle>By Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {(data?.byProvider || []).map((item) => (
              <div key={item.provider} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{item.provider}</span>
                  <span className="text-2xl font-bold">${item.cost.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.runs} runs • ${(item.cost / item.runs).toFixed(4)}/run
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
