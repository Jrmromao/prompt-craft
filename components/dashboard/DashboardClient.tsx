'use client';

import { Suspense, useState, useEffect } from "react";
import { UserSummaryCard } from "@/components/dashboard/UserSummaryCard";
import { RecentPromptsTable } from "@/components/dashboard/RecentPromptsTable";
import { CreditHistoryTable } from "@/components/dashboard/CreditHistoryTable";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { PromptTemplatesCard } from "@/components/dashboard/PromptTemplatesCard";
import { Sun, Moon } from "lucide-react";
import { UserWithPlan } from "@/types/prisma";
import { Prompt } from "@/types/prisma";
import { CreditHistory } from "@/types/prisma";

const mockUsageStats = [
  { date: "2024-06-01", credits: 5 },
  { date: "2024-06-02", credits: 0 },
  { date: "2024-06-03", credits: 3 },
  { date: "2024-06-04", credits: 7 },
  { date: "2024-06-05", credits: 2 },
  { date: "2024-06-06", credits: 4 },
  { date: "2024-06-07", credits: 1 },
];

interface DashboardClientProps {
  user: UserWithPlan;
  prompts: Prompt[];
  creditHistory: CreditHistory[];
  usageData?: { date: string; credits: number }[];
}

export function DashboardClient({ user, prompts, creditHistory, usageData }: DashboardClientProps) {
  const [darkMode, setDarkMode] = useState(true);

  // Theme persistence
  useEffect(() => {
    const storedTheme = localStorage.getItem("dashboard-theme");
    if (storedTheme === "light") setDarkMode(false);
    else setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={
      `container mx-auto px-4 py-8 space-y-8 transition-colors duration-300 ${darkMode ? 'dark bg-black' : 'bg-white'}`
    }>
      {/* Light/Dark Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="rounded-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:scale-110 transition-transform"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UserSummaryCard user={user} />
      </Suspense>

      {/* Prompt Templates Section */}
      <PromptTemplatesCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RecentPromptsTable prompts={prompts} />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <CreditHistoryTable history={creditHistory} />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UsageChart userId={user.id} usageData={usageData || mockUsageStats} />
      </Suspense>

      {(user.plan?.name === "FREE" || user.credits < 10) && (
        <Suspense fallback={<div>Loading...</div>}>
          <UpgradeBanner />
        </Suspense>
      )}
    </div>
  );
} 