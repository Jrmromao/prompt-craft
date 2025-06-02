'use client';

import { Suspense } from "react";
import { UserSummaryCard } from "@/components/dashboard/UserSummaryCard";
import { RecentPromptsTable } from "@/components/dashboard/RecentPromptsTable";
import { CreditHistoryTable } from "@/components/dashboard/CreditHistoryTable";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { UserWithPlan } from "@/types/prisma";
import { Prompt } from "@/types/prisma";
import { CreditHistory } from "@/types/prisma";

interface DashboardClientProps {
  user: UserWithPlan;
  prompts: Prompt[];
  creditHistory: CreditHistory[];
}

export function DashboardClient({ user, prompts, creditHistory }: DashboardClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UserSummaryCard user={user} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RecentPromptsTable prompts={prompts} />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <CreditHistoryTable history={creditHistory} />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsageChart userId={user.id} />
      </Suspense>

      {(user.plan?.name === "FREE" || user.credits < 10) && (
        <Suspense fallback={<div>Loading...</div>}>
          <UpgradeBanner />
        </Suspense>
      )}
    </div>
  );
} 