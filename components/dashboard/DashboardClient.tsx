'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, 
  History, 
  CreditCard, 
  Sun, 
  Moon, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Settings,
  Shield,
  CreditCard as BillingIcon,
  ChevronRight,
  Bell,
  User,
  Lock,
  Key,
  CreditCard as CardIcon,
  Receipt,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { NavBar } from '@/components/layout/NavBar';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '../ui/error-boundary';
import { LucideIcon } from 'lucide-react';
import type { Prompt, CreditHistory, UsageData, DashboardClientProps } from '../../types/dashboard';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ThemeToggle = React.memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="fixed right-6 top-6 z-50 border border-border bg-background/80 backdrop-blur transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});

const StatsCard = React.memo(function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  trend,
  trendValue
}: { 
  title: string; 
  value: string | number; 
  icon: LucideIcon; 
  color: string; 
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 rounded-xl border-l-4 border-${color}-500 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white flex items-center gap-2">
            <Icon className={`h-5 w-5 text-${color}-400`} /> {title}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </div>
          )}
        </div>
        <div className={`text-3xl font-extrabold text-${color}-600 dark:text-${color}-400 mb-2`}>
          {value}
        </div>
        {subtitle && (
          <p className={`text-sm font-medium text-${color}-500 dark:text-${color}-300`}>
            {subtitle}
          </p>
        )}
      </Card>
    </motion.div>
  );
});

const TableRow = React.memo(function TableRow({ 
  children, 
  index 
}: { 
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="border-b last:border-0 hover:bg-gradient-to-r hover:from-purple-900/10 hover:to-pink-900/10 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-colors"
      role="row"
    >
      {children}
    </motion.tr>
  );
});

const SettingsCard = React.memo(function SettingsCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  badge,
  isNew,
  shortcut
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  badge?: string;
  isNew?: boolean;
  shortcut?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href}>
        <Card className={`p-6 rounded-xl border-l-4 border-${color}-500 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          
          <div className="flex items-start justify-between relative">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 group-hover:bg-${color}-200 dark:group-hover:bg-${color}-900/50 transition-colors duration-300`}>
                <Icon className={`h-6 w-6 text-${color}-500`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                  {isNew && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {description}
                </p>
                {shortcut && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">⌘</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{shortcut}</kbd>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {badge && (
                <Badge variant="outline" className={`border-${color}-200 text-${color}-600 dark:border-${color}-800 dark:text-${color}-400`}>
                  {badge}
                </Badge>
              )}
              <ChevronRight className={`h-5 w-5 text-gray-400 group-hover:text-${color}-500 transition-colors duration-300 group-hover:translate-x-1`} />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});

const SettingsGroup = React.memo(function SettingsGroup({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
});

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { title: 'Dashboard', icon: Home, href: '/dashboard' },
  { title: 'Profile', icon: User, href: '/settings/profile' },
  { title: 'Security', icon: Lock, href: '/settings/security' },
  { title: 'Billing', icon: CreditCard, href: '/settings/billing' },
  { title: 'History', icon: History, href: '/history' },
  { title: 'Help', icon: HelpCircle, href: '/help' },
];

const SidebarItem = React.memo(function SidebarItem({
  item,
  isActive,
  onClick
}: {
  item: SidebarItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.title}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </button>
  );
});

export default function DashboardClient({
  user,
  prompts: recentPrompts,
  creditHistory,
  usageData,
}: DashboardClientProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    setError(error);
    console.error('Dashboard error:', error);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Available Credits</h3>
                <div className="text-3xl font-bold">{user.credits}</div>
                <Progress value={(user.credits / user.creditCap) * 100} className="mt-2" />
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Plan</h3>
                <div className="text-3xl font-bold">{user.plan?.name || 'Free'}</div>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Activity</h3>
                <div className="text-3xl font-bold">
                  {recentPrompts.length > 0 ? formatDate(recentPrompts[recentPrompts.length - 1].createdAt) : 'No activity'}
                </div>
              </Card>
            </div>
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <p className="text-gray-500">Update your personal details and preferences</p>
                </div>
                {/* Add profile form here */}
              </div>
            </Card>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-8">Security Settings</h1>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Password & Authentication</h3>
                  <p className="text-gray-500">Manage your password and security settings</p>
                </div>
                {/* Add security settings here */}
              </div>
            </Card>
          </motion.div>
        );
      case 'billing':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Plan</h3>
                  <p className="text-gray-500">Manage your subscription and payment methods</p>
                </div>
                {/* Add billing settings here */}
              </div>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're having trouble loading your dashboard. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're having trouble loading your dashboard. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      }
    >
      <NavBar user={user} />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={activeSection === item.href.split('/').pop()}
                onClick={() => setActiveSection(item.href.split('/').pop() || 'dashboard')}
              />
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
}
