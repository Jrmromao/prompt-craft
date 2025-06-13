import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle, History, CreditCard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCreditUsage } from '@/hooks/useCreditUsage';
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

interface Prompt {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  creditsUsed: number;
}

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    credits: number;
    creditCap: number;
    planType: string;
  };
  recentPrompts: Prompt[];
}

export function DashboardClient({ user, recentPrompts }: DashboardClientProps) {
  const { data: creditData, loading: creditLoading } = useCreditUsage();
  const creditUsage = creditData ? (creditData.currentBalance / creditData.creditCap) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your account</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Available Credits</h3>
          <div className="text-2xl font-bold">
            {creditLoading ? 'Loading...' : creditData?.currentBalance}
          </div>
          <Progress value={creditUsage} className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {creditData ? `${creditData.creditCap - creditData.currentBalance} credits remaining` : 'Loading...'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Current Plan</h3>
          <div className="text-2xl font-bold capitalize">
            {creditLoading ? 'Loading...' : creditData?.planType}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {creditData?.planType === 'FREE' ? 'Upgrade for more features' : 'Active subscription'}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Last Activity</h3>
          <div className="text-2xl font-bold">
            {recentPrompts[0]?.createdAt
              ? new Date(recentPrompts[0].createdAt).toLocaleDateString()
              : 'No activity'}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {recentPrompts.length} prompts this month
          </p>
        </Card>
      </div>

      {/* Credit Usage Chart */}
      {creditData && (
        <Card className="mb-8 p-6">
          <h3 className="mb-4 text-lg font-medium">Credit Usage History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={creditData.dailyUsage}>
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
      )}

      {/* Recent Prompts */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Prompts</h2>
          <Button asChild>
            <Link href="/prompts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Prompt
            </Link>
          </Button>
        </div>

        {recentPrompts.length === 0 ? (
          <EmptyState
            icon={PlusCircle}
            title="No prompts yet"
            description="Create your first prompt to get started with PromptHive."
            action={
              <Button onClick={() => (window.location.href = '/prompts/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Prompt
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {recentPrompts.map(prompt => (
              <Card key={prompt.id} className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{prompt.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{prompt.description}</p>
                    <div className="text-sm text-muted-foreground">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{prompt.creditsUsed} credits</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/prompts/${prompt.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Credit Activity */}
      {creditData && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Credit Activity</h2>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/api/credits/export';
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export History
            </Button>
          </div>
          {creditData.recentActivity.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No credit history"
              description="Your credit usage and additions will appear here."
            />
          ) : (
            <div className="space-y-4">
              {creditData.recentActivity.map(entry => (
                <Card key={entry.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{entry.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={entry.amount > 0 ? 'default' : 'secondary'}>
                      {entry.amount > 0 ? '+' : ''}
                      {entry.amount} credits
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
