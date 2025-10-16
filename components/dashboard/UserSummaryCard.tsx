import { UserWithPlan } from '@/types/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Zap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface UserSummaryCardProps {
  user: UserWithPlan;
}

export function UserSummaryCard({ user }: UserSummaryCardProps) {
  // Calculate next reset date (1st of next month)
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  return (
    <Card className="p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-2xl font-bold">{user.monthlyCredits + user.purchasedCredits}</span>
            <span className="text-muted-foreground">credits available</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Plan: {user.plan?.name ?? 'Free'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Next reset: {format(nextReset, 'yyyy-MM-dd')}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          {(user.plan?.name === 'FREE' || (user.monthlyCredits + user.purchasedCredits) < 10) && (
            <Button variant="outline" asChild>
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
