'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  BarChart2,
  CreditCard as BillingIcon,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Circle,
  Lock,
  Shield,
} from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import { useClerk, UserProfile } from '@clerk/nextjs';
import { ProfileForm } from './profile-form';
import { Role, PlanType } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useState as useReactState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { KeyedMutator } from 'swr';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSidebarStore } from '@/components/layout/NavBarWrapper';
import { useTheme } from '@/components/ThemeProvider';
import { UsageTab } from '@/components/profile/UsageTab';
import BillingInvoicesSection from '../../components/profile/BillingInvoicesSection';
import PrivacySettingsPage from './privacy/page';

const Sheet = dynamic(() => import('@/components/ui/sheet').then(mod => mod.Sheet), {
  ssr: false,
});
const SheetContent = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetContent), {
  ssr: false,
});

const accountOptions = [
  { label: 'Overview', icon: User, href: 'overview' },
  { label: 'Usage & Activity', icon: BarChart2, href: 'usage' },
  { label: 'Billing', icon: BillingIcon, href: 'billing' },
  { label: 'Settings', icon: Settings, href: 'settings' },
  { label: 'Security', icon: Lock, href: 'security' },
  { label: 'Privacy', icon: Shield, href: 'privacy' },
];
const workspaceOptions = [{ label: 'My Prompts', icon: FileText, href: 'prompts' }];

const PRIVATE_PROMPT_LIMITS = {
  [PlanType.PRO]: 5,
  [PlanType.ELITE]: Infinity,
  [PlanType.ENTERPRISE]: Infinity,
};

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
    lastActivity?: string;
  };
  currentPath: string;
}

interface EmailPreferences {
  marketingEmails: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  browserNotifications: boolean;
}

interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
}

interface SettingsData {
  emailPreferences: EmailPreferences;
  notificationSettings: NotificationSettings;
  themeSettings: ThemeSettings;
}

interface SettingsSectionProps {
  data: SettingsData;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<SettingsData>;
}

interface SecuritySectionProps {
  data: any;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<any>;
  loginHistory: any;
  loginHistoryError: any;
  loginHistoryLoading: boolean;
  mutateLoginHistory: KeyedMutator<any>;
}

interface UsageData {
  totalCreditsUsed: number;
  creditsRemaining: number;
  creditCap: number;
  lastCreditReset: string;
  totalRequests: number;
  dailyUsage: Array<{ date: string; used: number }>;
  recentActivity: Array<{
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
}

type Theme = 'light' | 'dark' | 'system';

function SettingsSection(props: SettingsSectionProps) {
  const { data, error, isLoading, mutate } = props;
  const [isSaving, setIsSaving] = useState(false);
  const { setTheme } = useTheme();

  // Default values for settings
  const defaultEmailPreferences: EmailPreferences = {
    marketingEmails: true,
    productUpdates: true,
    securityAlerts: true,
  };

  if (isLoading && !data) {
    return (
      <div className="p-8">
        <div className="mb-4 h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load settings.</div>;
  }

  // Use default values if data is not available
  const emailPreferences = data?.emailPreferences || defaultEmailPreferences;

  const handleSettingsUpdate = async (type: string, newData: any) => {
    setIsSaving(true);
    const previous = data;
    mutate({ ...data, [type]: newData }, false); // Optimistic update
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: newData }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      toast.success('Settings updated');
      mutate(); // Revalidate
    } catch (error) {
      mutate(previous, false); // Rollback
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setTheme(value);
      handleSettingsUpdate('theme', { ...data?.themeSettings, theme: value });
    }
  };

  return (
    <div className="flex flex-col gap-8">
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
              checked={emailPreferences.marketingEmails}
              onCheckedChange={checked =>
                handleSettingsUpdate('email', {
                  ...emailPreferences,
                  marketingEmails: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Product Updates</Label>
            <Switch
              checked={emailPreferences.productUpdates}
              onCheckedChange={checked =>
                handleSettingsUpdate('email', {
                  ...emailPreferences,
                  productUpdates: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Security Alerts</Label>
            <Switch
              checked={emailPreferences.securityAlerts}
              onCheckedChange={checked =>
                handleSettingsUpdate('email', {
                  ...emailPreferences,
                  securityAlerts: checked,
                })
              }
              disabled={isSaving}
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
              onCheckedChange={checked =>
                handleSettingsUpdate('notifications', {
                  ...data.notificationSettings,
                  emailNotifications: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Push Notifications</Label>
            <Switch
              checked={data.notificationSettings.pushNotifications}
              onCheckedChange={checked =>
                handleSettingsUpdate('notifications', {
                  ...data.notificationSettings,
                  pushNotifications: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Browser Notifications</Label>
            <Switch
              checked={data.notificationSettings.browserNotifications}
              onCheckedChange={checked =>
                handleSettingsUpdate('notifications', {
                  ...data.notificationSettings,
                  browserNotifications: checked,
                })
              }
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>
      {/* Language & Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>Customize your interface appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={data.themeSettings.theme}
              onValueChange={handleThemeChange}
              disabled={isSaving}
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
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySection({ data, error, isLoading, mutate }: SecuritySectionProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading security settings...</div>
    );
  }
  if (error || !data) {
    return <div className="p-8 text-center text-red-500">Failed to load security settings.</div>;
  }
  return (
    <section className="flex w-full flex-col px-8">
      <h2 className="mb-2 flex w-full max-w-4xl items-center gap-2 text-2xl font-bold">
        <Lock className="h-6 w-6 text-[#5A43F1]" aria-hidden="true" />
        Authentication
      </h2>
      <p className="mb-2 w-full max-w-4xl text-muted-foreground">
        Manage your account security and authentication settings.
      </p>
      <div className="mb-6 flex w-full max-w-4xl items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 shadow-sm">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white">
          <svg
            width="18"
            height="18"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="16" fill="#fff" />
            <path
              d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6ZM16 24C11.589 24 8 20.411 8 16C8 11.589 11.589 8 16 8C20.411 8 24 11.589 24 16C24 20.411 20.411 24 16 24ZM16 10C13.243 10 11 12.243 11 15C11 17.757 13.243 20 16 20C18.757 20 21 17.757 21 15C21 12.243 18.757 10 16 10ZM16 18C14.346 18 13 16.654 13 15C13 13.346 14.346 12 16 12C17.654 12 19 13.346 19 15C19 16.654 17.654 18 16 18Z"
              fill="#5A43F1"
            />
          </svg>
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Authentication powered by <span className="font-semibold text-[#5A43F1]">Clerk</span>
        </span>
      </div>
      <div className="w-full max-w-4xl">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              card: 'rounded-lg shadow-none bg-background w-full',
            },
          }}
        />
      </div>
    </section>
  );
}

function ProfileHeader({
  user,
  status,
  statusColor,
  statusLabel,
  isPro,
  canUpgrade,
  creditPercentage,
  router,
}: {
  user: ProfileClientProps['user'];
  status: 'active' | 'trial' | 'suspended';
  statusColor: string;
  statusLabel: string;
  isPro: boolean;
  canUpgrade: boolean;
  creditPercentage: number;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Card className="relative flex flex-col items-stretch gap-0 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg md:flex-row">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-2xl" />
        <div className="animate-pulse-slow absolute bottom-0 right-0 h-32 w-32 rounded-full bg-gradient-to-tr from-pink-500/10 to-purple-500/20 blur-2xl" />
      </div>
      {/* 2-column layout */}
      <div className="z-10 flex flex-1 flex-col justify-center gap-2 md:gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-2xl font-bold text-foreground">
            {user.name || 'Unnamed User'}
            <span className="ml-1 inline-flex items-center">
              <Circle className={`mr-1 h-3 w-3 ${statusColor}`} />
              <span className="text-xs text-muted-foreground">{statusLabel}</span>
            </span>
          </span>
          <Badge
            className={`bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white ${isPro ? 'shadow-[0_0_8px_2px_rgba(168,85,247,0.4)]' : ''}`}
          >
            {isPro && <Sparkles className="animate-spin-slow mr-1 h-3 w-3" />}
            {user.planType}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {user.planType === 'FREE' && (
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700"
              onClick={() => router.push('/pricing')}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{user.email}</div>
        <div className="text-xs capitalize text-muted-foreground">{user.role}</div>
      </div>
      {/* Credits Widget (right column) */}
      <div className="z-10 mt-8 flex min-w-[260px] flex-col items-end justify-center md:mt-0 md:pl-12">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Credits</span>
          <Sparkles className="h-4 w-4 animate-pulse text-purple-400" />
        </div>
        <div className="flex w-full items-center gap-2">
          <Progress
            value={creditPercentage}
            className="h-2 flex-1 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
          />
          <span className="ml-2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
            {user.credits} / {user.creditCap}
          </span>
          {canUpgrade && (
            <Button
              size="sm"
              className="ml-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-xs font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700"
              onClick={() => router.push('/billing')}
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProfileContent({ user, currentPath }: ProfileClientProps) {
  const router = useRouter();
  const { isOpen: sidebarOpen, close: closeSidebar } = useSidebarStore();
  const { signOut } = useClerk();
  const validTabs = ['overview', 'usage', 'billing', 'settings', 'security', 'privacy', 'prompts'];
  const [activeTab, setActiveTab] = useState(
    currentPath && validTabs.includes(currentPath) ? currentPath : 'overview'
  );

  function handleSidebarClick(tabValue: string) {
    setActiveTab(tabValue);
    closeSidebar();
  }

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  // Simulate status (in real app, fetch from subscription)
  const status: 'active' | 'trial' | 'suspended' = 'active';
  const statusColor =
    status === 'active' ? 'bg-green-500' : status === 'trial' ? 'bg-yellow-400' : 'bg-red-500';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const isPro = user.planType === 'PRO';
  const canUpgrade = !isPro;
  const creditPercentage = (user.credits / user.creditCap) * 100;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold text-muted-foreground">Account</div>
          <nav className="mb-6 flex flex-col gap-1">
            {accountOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSidebarClick(opt.href.replace('/profile', '') || 'overview')}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeTab === (opt.href.replace('/profile', '') || 'overview') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                data-testid={`sidebar-${opt.label.toLowerCase()}-button`}
              >
                {activeTab === (opt.href.replace('/profile', '') || 'overview') && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-purple-500" />
                )}
                <opt.icon className="h-4 w-4 text-purple-400" />
                {opt.label}
              </button>
            ))}
          </nav>
          <Separator />
          <div className="mb-2 mt-6 text-xs font-semibold text-muted-foreground">Workspace</div>
          <nav className="flex flex-col gap-1">
            {workspaceOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSidebarClick('prompts')}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${activeTab === 'prompts' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              >
                {activeTab === 'prompts' && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-purple-500" />
                )}
                <opt.icon className="h-4 w-4 text-purple-400" />
                {opt.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-auto flex flex-col items-center border-t border-border pt-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  function UsageStatsSection() {
    const { data: usageData, error: usageError, isLoading: usageLoading } = useSWR<UsageData>('/api/usage', fetcher);
    const recentActivity = usageData?.recentActivity || [];

    if (usageLoading) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Loading usage statistics...
        </div>
      );
    }

    if (usageError || !usageData) {
      return (
        <div className="p-8 text-center text-red-500">
          Failed to load usage statistics.
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Usage Chart */}
        <div>
          <div className="mb-2 text-sm font-semibold">Daily Usage</div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData.dailyUsage}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => new Date(d).toLocaleDateString()}
                />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={d => `Date: ${new Date(d).toLocaleDateString()}`}
                  formatter={v => [`${v} credits`, 'Used']}
                />
                <Area
                  type="monotone"
                  dataKey="used"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                  strokeWidth={3}
                  dot={{ r: 3, stroke: '#a855f7', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5, fill: '#a855f7' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Recent Activity Table */}
        <div>
          <div className="mb-2 text-sm font-semibold">Recent Activity</div>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-lg border text-sm">
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
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No recent activity
                    </td>
                  </tr>
                )}
                {recentActivity.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(a.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{a.description || '-'}</td>
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

  function PromptsSection() {
    const [search, setSearch] = useReactState('');
    const [debouncedSearch, setDebouncedSearch] = useReactState('');
    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(t);
    }, [search]);
    const { data, error, isLoading, mutate } = useSWR(
      `/api/prompts?search=${encodeURIComponent(debouncedSearch)}`,
      url => fetch(url).then(r => r.json())
    );

    return (
      <div className="flex flex-col gap-6">
        <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-64"
          />
          <button
            className="ml-auto rounded bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              /* TODO: open create prompt dialog */
            }}
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
            <table className="min-w-full rounded-lg border text-sm">
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
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No prompts found
                    </td>
                  </tr>
                )}
                {data?.prompts?.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{p.name}</td>
                    <td className="px-3 py-2 capitalize">{p.promptType || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // SWR setup at the top of ProfileClient
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const {
    data: settingsData,
    error: settingsError,
    isLoading: settingsLoading,
    mutate: mutateSettings,
  } = useSWR('/api/settings', fetcher, {
    dedupingInterval: 30000, // 30 seconds
    revalidateOnFocus: false,
  });
  const {
    data: loginHistory,
    error: loginHistoryError,
    isLoading: loginHistoryLoading,
    mutate: mutateLoginHistory,
  } = useSWR('/api/settings/login-history', fetcher, {
    dedupingInterval: 30000,
    revalidateOnFocus: false,
  });

  const { data: promptStats } = useSWR('/api/prompts/stats', fetcher);
  const privatePromptLimit = PRIVATE_PROMPT_LIMITS[user.planType as PlanType];
  const privatePromptCount = promptStats?.privatePromptCount || 0;
  const privatePromptPercentage =
    privatePromptLimit === Infinity ? 0 : (privatePromptCount / privatePromptLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />
      {/* Mobile/Tablet Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={closeSidebar}>
        <SheetContent side="left" className="w-64 p-0">
          <ErrorBoundary fallback={<div>Error</div>}>{SidebarContent}</ErrorBoundary>
        </SheetContent>
      </Sheet>
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 pt-8">
        {/* Desktop Sidebar */}
        <ErrorBoundary fallback={<div>Error</div>}>
          <aside className="mt-4 hidden h-fit w-72 shrink-0 flex-col rounded-2xl border border-border bg-card px-6 py-8 md:flex sticky top-16">
            {SidebarContent}
          </aside>
        </ErrorBoundary>
        {/* Main Content */}
        <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-8">
          {/* Tabs for profile sections */}
          <ErrorBoundary fallback={<div>Error</div>}>
            <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="overview" className="w-full">
              <TabsContent value="overview">
                <div className="flex flex-col gap-8">
                  {/* Profile Summary Card */}
                  <Card className="rounded-2xl border border-border bg-card p-6 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.imageUrl} alt={user.name || user.email} />
                        <AvatarFallback>{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-2xl font-bold text-foreground">{user.name || 'Unnamed User'}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
                        <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {user.planType}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 w-full">
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex-1 flex flex-col items-center md:items-start">
                          <span className="text-xs font-medium text-muted-foreground">Credits</span>
                          <div className="flex items-center gap-2 w-full">
                            <Progress
                              value={(user.credits / user.creditCap) * 100}
                              className="h-2 flex-1 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
                              aria-label="Credits Progress"
                            />
                            <span className="ml-2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                              {user.credits} / {user.creditCap}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center md:items-start">
                          <span className="text-xs font-medium text-muted-foreground">Last Activity</span>
                          <span className="text-sm text-foreground">{user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                       
                        {user.planType === 'FREE' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700"
                            onClick={() => router.push('/pricing')}
                            aria-label="Upgrade Plan"
                          >
                            Upgrade Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                  {/* Profile Edit Form */}
                  <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                    <ProfileForm
                      user={{
                        ...user,
                        role: user.role as Role,
                        planType: user.planType as PlanType,
                      }}
                    />
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="usage">
                <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <UsageStatsSection />
                </Card>
              </TabsContent>
              <TabsContent value="billing" className="pt-4">
                <BillingInvoicesSection />
              </TabsContent>
              <TabsContent value="prompts">
                <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <PromptsSection />
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <SettingsSection
                    data={settingsData}
                    error={settingsError}
                    isLoading={settingsLoading}
                    mutate={mutateSettings}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="security">
                <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <SecuritySection
                    data={settingsData}
                    error={settingsError}
                    isLoading={settingsLoading}
                    mutate={mutateSettings}
                    loginHistory={loginHistory}
                    loginHistoryError={loginHistoryError}
                    loginHistoryLoading={loginHistoryLoading}
                    mutateLoginHistory={mutateLoginHistory}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="privacy">
                <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <PrivacySettingsPage />
                </Card>
              </TabsContent>
            </Tabs>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export function ProfileClient({ user, currentPath }: ProfileClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent user={user} currentPath={currentPath} />
    </Suspense>
  );
}
