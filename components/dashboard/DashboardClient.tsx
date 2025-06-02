'use client';

import { Suspense } from "react";
import { UserSummaryCard } from "@/components/dashboard/UserSummaryCard";
import { RecentPromptsTable } from "@/components/dashboard/RecentPromptsTable";
import { CreditHistoryTable } from "@/components/dashboard/CreditHistoryTable";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { PromptTemplatesCard } from "@/components/dashboard/PromptTemplatesCard";
import { Role, PlanType, Period, CreditType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, History, Plus, LogOut, Sun, Moon, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CreatePromptDialog } from "@/components/prompts/CreatePromptDialog";
import { useTheme } from "next-themes";
import { useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types for serializable props
interface SerializableUserWithPlan {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  credits: number;
  plan: {
    id: string;
    name: string;
    features: string[];
    price: number;
    createdAt: string;
    updatedAt: string;
    credits: number;
    creditCap: number;
    type: string;
    period: string;
    isActive: boolean;
  } | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  creditCap: number;
  lastCreditReset: string;
}

interface SerializablePrompt {
  id: string;
  name: string;
  content: string;
  metadata: any;
  promptType: string;
  description: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializableCreditHistory {
  id: string;
  createdAt: string;
  type: string;
  description: string | null;
  userId: string;
  amount: number;
}

interface DashboardClientProps {
  user: SerializableUserWithPlan;
  prompts: SerializablePrompt[];
  creditHistory: SerializableCreditHistory[];
  usageData?: { date: string; credits: number }[];
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Sun className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function NavBar({ user }: { user: SerializableUserWithPlan }) {
  const { signOut } = useClerk();
  const userInitials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PromptCraft
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-400"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

function PromptActionsCard({ user }: { user: SerializableUserWithPlan }) {
  const isFreeTier = user.role === 'FREE';
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Prompt Actions
        </CardTitle>
        <CardDescription>
          {isFreeTier 
            ? "Create new prompts or upgrade to access prompt history"
            : "Manage your prompts and create new ones"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isFreeTier ? (
          <>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Prompt
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Link href="/pricing">
                Upgrade to Access Prompt History
              </Link>
            </Button>
            <CreatePromptDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </>
        ) : (
          <>
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Link href="/prompts">
                <Plus className="w-4 h-4 mr-2" />
                Create New Prompt
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Link href="/prompts">
                <History className="w-4 h-4 mr-2" />
                View Prompt History
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardClient({ user, prompts, creditHistory, usageData }: DashboardClientProps) {
  // Convert serializable props to correct types
  const hydratedUser = {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    lastCreditReset: new Date(user.lastCreditReset),
    role: user.role as Role,
    plan: user.plan
      ? {
          ...user.plan,
          createdAt: new Date(user.plan.createdAt),
          updatedAt: new Date(user.plan.updatedAt),
          type: user.plan.type as PlanType,
          period: user.plan.period as Period,
        }
      : null,
  };
  const hydratedPrompts = prompts.map((p) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
  const hydratedCreditHistory = creditHistory.map((h) => ({
    ...h,
    createdAt: new Date(h.createdAt),
    type: h.type as CreditType,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar user={user} />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <UserSummaryCard user={hydratedUser} />
        </Suspense>

        {/* Prompt Actions Section */}
        <PromptActionsCard user={user} />

        {/* Prompt Templates Section */}
        <PromptTemplatesCard />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div>Loading...</div>}>
            <RecentPromptsTable prompts={hydratedPrompts} />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <CreditHistoryTable history={hydratedCreditHistory} />
          </Suspense>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <UsageChart userId={hydratedUser.id} usageData={usageData || []} />
        </Suspense>

        {(hydratedUser.plan?.name === "FREE" || hydratedUser.credits < 10) && (
          <Suspense fallback={<div>Loading...</div>}>
            <UpgradeBanner />
          </Suspense>
        )}
      </div>
    </div>
  );
} 