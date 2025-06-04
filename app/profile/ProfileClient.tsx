"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, BarChart2, CreditCard as BillingIcon, FileText, Settings, LogOut, Sparkles, CheckCircle2, Pencil, Circle } from "lucide-react";
import { NavBar } from "@/components/layout/NavBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { useClerk } from "@clerk/nextjs";
import { ProfileForm } from "./profile-form";
import { Role, PlanType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useState as useReactState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
    bio?: string;
    jobTitle?: string;
    location?: string;
    company?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
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
    const { totalCreditsUsed, creditsRemaining, creditCap, lastCreditReset, totalRequests, dailyUsage, recentActivity } = data;

    return (
      <div className="flex flex-col gap-8">
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
          </div>
          <div className="w-full h-48 md:h-56 bg-background rounded-xl border border-border">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsage} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => {
                    const date = new Date(d);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  fontSize={12}
                  tick={{ fill: "#a1a1aa" }}
                  minTickGap={4}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "#a1a1aa" }}
                  width={32}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", color: "#333" }}
                  labelFormatter={d => `Date: ${new Date(d).toLocaleDateString()}`}
                  formatter={v => [`${v} credits`, "Used"]}
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, stroke: "#a855f7", strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 5, fill: "#a855f7" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Recent Activity Table */}
        <div>
          <div className="font-semibold text-sm mb-2">Recent Activity</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No recent activity</td></tr>
                )}
                {recentActivity.map((a: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(a.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{a.description || "-"}</td>
                    <td className="px-3 py-2 text-right">{a.amount}</td>
                    <td className="px-3 py-2 capitalize">{a.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function BillingSection() {
    const { data, error, isLoading, mutate } = useSWR("/api/billing/overview", (url) => fetch(url).then(r => r.json()));
    const [portalLoading, setPortalLoading] = useReactState(false);
    const [search, setSearch] = useReactState("");
    const [debouncedSearch, setDebouncedSearch] = useReactState("");

    // Debounce search input
    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(t);
    }, [search]);

    if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading billing info...</div>;
    }
    if (error || !data) {
      return <div className="p-8 text-center text-red-500">Failed to load billing info.</div>;
    }

    const { subscription, invoices, paymentMethods } = data;
    const plan = subscription?.items?.data?.[0]?.price?.nickname || "Unknown";
    const renewal = subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toLocaleDateString() : "-";
    const status = subscription?.status || "Unknown";
    const card = paymentMethods?.[0];

    // Filter invoices by search
    const filteredInvoices = (invoices || []).filter((inv: any) => {
      if (!debouncedSearch) return true;
      const date = new Date(inv.created * 1000).toLocaleDateString();
      const amount = (inv.amount_paid / 100).toLocaleString(undefined, { style: 'currency', currency: inv.currency.toUpperCase() });
      return (
        date.includes(debouncedSearch) ||
        amount.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (inv.status || "").toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    });

    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg bg-muted p-6 flex flex-col gap-2">
            <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
            <div className="text-lg font-bold flex items-center gap-2">
              {plan}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{status}</span>
            </div>
            <div className="text-xs text-muted-foreground">Renews: {renewal}</div>
          </div>
          <div className="rounded-lg bg-muted p-6 flex flex-col gap-2">
            <div className="text-xs text-muted-foreground mb-1">Payment Method</div>
            {card ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                <span className="font-mono">**** **** **** {card.card.last4}</span>
                <span className="text-xs text-muted-foreground">{card.card.brand.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">Exp {card.card.exp_month}/{card.card.exp_year}</span>
              </div>
            ) : (
              <div className="text-muted-foreground">No card on file</div>
            )}
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
            disabled={portalLoading}
            onClick={async () => {
              setPortalLoading(true);
              try {
                const res = await fetch("/api/billing/portal", { method: "POST" });
                if (!res.ok) throw new Error("Failed to create portal session");
                const { url } = await res.json();
                window.location.href = url;
              } catch (err) {
                toast.error("Could not open Stripe portal. Please try again.");
              } finally {
                setPortalLoading(false);
              }
            }}
          >
            {portalLoading ? "Loading..." : "Manage Subscription"}
          </button>
        </div>
        <div>
          <div className="font-semibold text-sm mb-2 flex items-center gap-4">
            <span>Invoices</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by date, status, or amount..."
              className="ml-auto px-3 py-1.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ maxWidth: 260 }}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No invoices</td></tr>
                )}
                {filteredInvoices.map((inv: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(inv.created * 1000).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{(inv.amount_paid / 100).toLocaleString(undefined, { style: 'currency', currency: inv.currency.toUpperCase() })}</td>
                    <td className="px-3 py-2 capitalize">{inv.status}</td>
                    <td className="px-3 py-2">
                      {inv.invoice_pdf ? (
                        <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">PDF</a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function PromptsSection() {
    const [search, setSearch] = useReactState("");
    const [debouncedSearch, setDebouncedSearch] = useReactState("");
    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(t);
    }, [search]);
    const { data, error, isLoading, mutate } = useSWR(`/api/prompts?search=${encodeURIComponent(debouncedSearch)}`, (url) => fetch(url).then(r => r.json()));

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="px-3 py-1.5 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
          />
          <button
            className="ml-auto px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition"
            onClick={() => { /* TODO: open create prompt dialog */ }}
          >
            + Create Prompt
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading prompts...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load prompts.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-semibold">Title</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Created</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {data?.prompts?.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">No prompts found</td></tr>
                )}
                {data?.prompts?.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{p.name}</td>
                    <td className="px-3 py-2 capitalize">{p.promptType || "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function SettingsSection() {
    const { data, error, isLoading, mutate } = useSWR("/api/settings", (url) => fetch(url).then(r => r.json()));
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("account");

    if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
    }
    if (error || !data) {
      return <div className="p-8 text-center text-red-500">Failed to load settings.</div>;
    }

    const handleSettingsUpdate = async (type: string, newData: any) => {
      try {
        const response = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, data: newData }),
        });

        if (!response.ok) throw new Error("Failed to update settings");

        await mutate();
        toast({
          title: "Settings updated",
          description: "Your settings have been saved successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="flex flex-col gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="space-y-6">
              {/* Email Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Preferences</CardTitle>
                  <CardDescription>Manage your email notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Marketing Emails</Label>
                    <Switch
                      checked={data.emailPreferences.marketingEmails}
                      onCheckedChange={(checked) => handleSettingsUpdate("email", { ...data.emailPreferences, marketingEmails: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Product Updates</Label>
                    <Switch
                      checked={data.emailPreferences.productUpdates}
                      onCheckedChange={(checked) => handleSettingsUpdate("email", { ...data.emailPreferences, productUpdates: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Security Alerts</Label>
                    <Switch
                      checked={data.emailPreferences.securityAlerts}
                      onCheckedChange={(checked) => handleSettingsUpdate("email", { ...data.emailPreferences, securityAlerts: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch
                      checked={data.notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingsUpdate("notifications", { ...data.notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Push Notifications</Label>
                    <Switch
                      checked={data.notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingsUpdate("notifications", { ...data.notificationSettings, pushNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Browser Notifications</Label>
                    <Switch
                      checked={data.notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => handleSettingsUpdate("notifications", { ...data.notificationSettings, browserNotifications: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Language & Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Language & Theme</CardTitle>
                  <CardDescription>Customize your interface preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={data.languagePreferences.language}
                      onValueChange={(value) => handleSettingsUpdate("language", { ...data.languagePreferences, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={data.themeSettings.theme}
                      onValueChange={(value) => handleSettingsUpdate("theme", { ...data.themeSettings, theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <Select
                      value={data.themeSettings.accentColor}
                      onValueChange={(value) => handleSettingsUpdate("theme", { ...data.themeSettings, accentColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accent color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <Switch
                      checked={data.securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => handleSettingsUpdate("security", { ...data.securitySettings, twoFactorEnabled: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={120}
                      value={data.securitySettings.sessionTimeout}
                      onChange={(e) => handleSettingsUpdate("security", { ...data.securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.sessions?.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-sm text-muted-foreground">{session.location}</p>
                          <p className="text-sm text-muted-foreground">Last active: {new Date(session.lastActive).toLocaleString()}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            fetch(`/api/settings/sessions?sessionId=${session.id}`, { method: "DELETE" })
                              .then(() => mutate())
                              .catch(() => toast({
                                title: "Error",
                                description: "Failed to revoke session",
                                variant: "destructive",
                              }));
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              {/* API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for programmatic access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.apiKeys?.map((key: any) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground">Created: {new Date(key.createdAt).toLocaleString()}</p>
                          {key.expiresAt && (
                            <p className="text-sm text-muted-foreground">Expires: {new Date(key.expiresAt).toLocaleString()}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            fetch(`/api/settings/api-keys?keyId=${key.id}`, { method: "DELETE" })
                              .then(() => mutate())
                              .catch(() => toast({
                                title: "Error",
                                description: "Failed to revoke API key",
                                variant: "destructive",
                              }));
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const name = prompt("Enter a name for your API key:");
                        if (name) {
                          fetch("/api/settings/api-keys", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name }),
                          })
                            .then(() => mutate())
                            .catch(() => toast({
                              title: "Error",
                              description: "Failed to generate API key",
                              variant: "destructive",
                            }));
                        }
                      }}
                    >
                      Generate New API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
          <ErrorBoundary>
            {SidebarContent}
          </ErrorBoundary>
        </SheetContent>
      </Sheet>
      <div className="flex w-full max-w-7xl mx-auto pt-8 px-4 gap-8">
        {/* Desktop Sidebar */}
        <ErrorBoundary>
          <aside className="w-72 shrink-0 hidden md:flex flex-col bg-card rounded-2xl py-8 px-6 h-fit mt-4 border border-border">
            {SidebarContent}
          </aside>
        </ErrorBoundary>
        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-8">
          {/* Profile Header Card */}
          <ErrorBoundary>
            <Card className="relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 p-8 bg-card border border-border rounded-2xl shadow-lg">
              {/* Gradient background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-purple-500/20 rounded-full blur-2xl animate-pulse-slow" />
              </div>
              {/* Avatar with edit overlay */}
              <div className="relative group">
                <AvatarUpload
                  currentImageUrl={user.imageUrl}
                  userId={user.id}
                  name={user.name || user.email}
                />
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
          </ErrorBoundary>
          {/* Tabs for profile sections */}
          <ErrorBoundary>
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
                <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
                  <BillingSection />
                </Card>
              </TabsContent>
              <TabsContent value="prompts">
                <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
                  <PromptsSection />
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
                  <SettingsSection />
                </Card>
              </TabsContent>
            </Tabs>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
} 