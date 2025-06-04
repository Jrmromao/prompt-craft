"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, BarChart2, CreditCard as BillingIcon, FileText, Settings, LogOut, Sparkles, CheckCircle2, Pencil, Circle } from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { useClerk } from "@clerk/nextjs";
import { ProfileForm } from "./profile-form";
import { Role, PlanType } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

const Sheet = dynamic(() => import("@/components/ui/sheet").then(mod => mod.Sheet), { ssr: false });
const SheetContent = dynamic(() => import("@/components/ui/sheet").then(mod => mod.SheetContent), { ssr: false });

const accountOptions = [
  { label: "Overview", icon: User, href: "overview" },
  { label: "Usage", icon: BarChart2, href: "usage" },
  { label: "Billing", icon: BillingIcon, href: "billing" },
  { label: "Settings", icon: Settings, href: "settings" },
];
const workspaceOptions = [
  { label: "My Prompts", icon: FileText, href: "prompts" },
];

export interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
    id: string;
    role: string;
    planType: string;
    credits: number;
    creditCap: number;
  };
  currentPath: string;
}

export function ProfileClient({ user, currentPath }: ProfileClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const creditPercentage = (user.credits / user.creditCap) * 100;

  // Determine active tab from query param
  const tab = searchParams.get("tab") || "overview";

  // Simulate status (in real app, fetch from subscription)
  const status: "active" | "trial" | "suspended" = "active";
  const statusColor = status === "active" ? "bg-green-500" : status === "trial" ? "bg-yellow-400" : "bg-red-500";
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isPro = user.planType === "PRO";
  const canUpgrade = !isPro;

  // Sidebar click handler
  function handleSidebarClick(tabValue: string) {
    router.push(`/profile?tab=${tabValue}`, { scroll: false });
    setSidebarOpen(false);
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-8">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Account</div>
          <nav className="flex flex-col gap-1 mb-6">
            {accountOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSidebarClick(opt.href.replace("/profile", "") || "overview")}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
                  ${tab === (opt.href.replace("/profile", "") || "overview") ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                {tab === (opt.href.replace("/profile", "") || "overview") && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded bg-purple-500" />
                )}
                <opt.icon className="w-4 h-4 text-purple-400" />
                {opt.label}
              </button>
            ))}
          </nav>
          <Separator />
          <div className="text-xs font-semibold text-muted-foreground mt-6 mb-2">Workspace</div>
          <nav className="flex flex-col gap-1">
            {workspaceOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSidebarClick("prompts")}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition w-full text-left
                  ${tab === "prompts" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                {tab === "prompts" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded bg-purple-500" />
                )}
                <opt.icon className="w-4 h-4 text-purple-400" />
                {opt.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-border flex flex-col items-center">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full justify-center"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  // Tab change handler
  function handleTabChange(value: string) {
    router.push(`/profile?tab=${value}`, { scroll: false });
  }

  function UsageStatsSection() {
    const { data, error, isLoading } = useSWR("/api/profile/usage", (url) => fetch(url).then(r => r.json()));

    if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading usage...</div>;
    }
    if (error || !data) {
      return <div className="p-8 text-center text-red-500">Failed to load usage data.</div>;
    }

    // Stats
    const { totalCreditsUsed, creditsRemaining, creditCap, lastCreditReset, totalRequests, dailyUsage } = data;

    // Chart dimensions
    const width = 320;
    const height = 80;
    const maxUsed = Math.max(...dailyUsage.map((d: any) => d.used), 1);
    const points = dailyUsage.map((d: any, i: number) => {
      const x = (i / (dailyUsage.length - 1)) * (width - 32) + 16;
      const y = height - (d.used / maxUsed) * (height - 24) - 8;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Credits Used</div>
            <div className="text-xl font-bold">{totalCreditsUsed}</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Credits Remaining</div>
            <div className="text-xl font-bold">{creditsRemaining}</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total Requests</div>
            <div className="text-xl font-bold">{totalRequests}</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Last Reset</div>
            <div className="text-sm font-semibold">{lastCreditReset ? new Date(lastCreditReset).toLocaleDateString() : "-"}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">Daily Usage (last 30 days)</div>
            <div className="text-xs text-muted-foreground">Max: {maxUsed}</div>
          </div>
          <svg width={width} height={height} className="w-full h-20">
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
              points={points}
              className="transition-all duration-300"
            />
            {/* Dots */}
            {dailyUsage.map((d: any, i: number) => {
              const x = (i / (dailyUsage.length - 1)) * (width - 32) + 16;
              const y = height - (d.used / maxUsed) * (height - 24) - 8;
              return <circle key={i} cx={x} cy={y} r={2} fill="#a855f7" />;
            })}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* NavBar with hamburger menu */}
      <NavBar
        user={user}
        onMenuClick={() => setSidebarOpen(true)}
      />
      {/* Mobile/Tablet Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {SidebarContent}
        </SheetContent>
      </Sheet>
      <div className="flex w-full max-w-7xl mx-auto pt-8 px-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="w-72 shrink-0 hidden md:flex flex-col bg-card rounded-2xl py-8 px-6 h-fit mt-4 border border-border">
          {SidebarContent}
        </aside>
        {/* Main Content */}
        <main className="flex-1 max-w-2xl w-full mx-auto flex flex-col gap-8">
          {/* Profile Header Card */}
          <Card className="relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 p-8 bg-card border border-border rounded-2xl shadow-lg">
            {/* Gradient background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-purple-500/20 rounded-full blur-2xl animate-pulse-slow" />
            </div>
            {/* Avatar with edit overlay */}
            <div className="relative group">
              <Avatar className="h-20 w-20 mb-4 md:mb-0 border-4 border-background shadow-lg">
                <AvatarImage src={user.imageUrl} alt={user.name || user.email} />
                <AvatarFallback>{(user.name || user.email)[0]}</AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition"
                aria-label="Edit avatar"
                tabIndex={0}
              >
                <Pencil className="w-4 h-4 text-purple-500" />
              </button>
            </div>
            <div className="flex-1 flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {user.name || "Unnamed User"}
                  <span className={`inline-flex items-center ml-2`}>
                    <Circle className={`w-3 h-3 mr-1 ${statusColor}`} />
                    <span className="text-xs text-muted-foreground">{statusLabel}</span>
                  </span>
                </span>
                <span className="relative ml-2">
                  <Badge className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1 animate-pulse ${isPro ? "shadow-[0_0_8px_2px_rgba(168,85,247,0.4)]" : ""}`}>
                    {isPro && <Sparkles className="w-4 h-4 animate-spin-slow" />}
                    {user.planType}
                  </Badge>
                </span>
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{user.role}</div>
            </div>
            {/* Credits Widget (desktop only) */}
            <div className="hidden md:flex flex-col items-end min-w-[180px] z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Credits</div>
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Your credits reset monthly. Upgrade for more.</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Progress value={creditPercentage} className="h-2 w-full bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 mt-1" />
              <div className="text-sm mt-1 text-muted-foreground flex items-center gap-2">
                {user.credits} / {user.creditCap}
                {canUpgrade && (
                  <button
                    className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition"
                    onClick={() => router.push("/billing")}
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </Card>
          {/* Tabs for profile sections */}
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            {/* <TabsList className="mb-4">
              <TabsTrigger value="overview">overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="prompts">My Prompts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList> */}
            <TabsContent value="overview">
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
                <ProfileForm user={{
                  ...user,
                  role: user.role as Role,
                  planType: user.planType as PlanType,
                }} />
              </Card>
            </TabsContent>
            <TabsContent value="usage">
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
                <UsageStatsSection />
              </Card>
            </TabsContent>
            <TabsContent value="billing">
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold">Billing and invoices coming soon.</div>
              </Card>
            </TabsContent>
            <TabsContent value="prompts">
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold">Your prompts management coming soon.</div>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg text-center text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold">Settings coming soon.</div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
} 