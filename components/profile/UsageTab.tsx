'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';

interface UsageTabProps {
  user: {
    credits: number;
    creditCap: number;
    planType: string;
    lastActivity?: string;
  };
  usageData: Array<{
    date: string;
    credits: number;
  }>;
  recentPrompts: Array<{
    id: string;
    title: string;
    createdAt: string;
    creditsUsed: number;
  }>;
}

export function UsageTab({ user, usageData, recentPrompts }: UsageTabProps) {
  return (
    <div className="space-y-8">
      {/* Credits Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Available Credits</h3>
          <div className="text-3xl font-bold">{user.credits}</div>
          <Progress value={(user.credits / user.creditCap) * 100} className="mt-2" />
          <p className="mt-2 text-sm text-gray-500">
            {user.credits} of {user.creditCap} credits used
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Plan</h3>
          <div className="text-3xl font-bold">{user.planType}</div>
          <p className="mt-2 text-sm text-gray-500">
            {user.planType === 'FREE' ? 'Upgrade for more features' : 'Active plan'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Last Activity</h3>
          <div className="text-3xl font-bold">
            {user.lastActivity ? format(new Date(user.lastActivity), 'MMM d, yyyy') : 'No activity'}
          </div>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Usage History</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
              />
              <YAxis />
              <RechartsTooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                formatter={(value: number) => [`${value} credits`, 'Credits Used']}
              />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <p className="font-medium">{prompt.title}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(prompt.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <Badge variant="secondary">{prompt.creditsUsed} credits</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 