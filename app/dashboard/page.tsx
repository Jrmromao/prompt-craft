'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, DollarSign, TrendingUp, BarChart3, AlertCircle, Activity, Clock, Settings, Copy, Check, Key } from 'lucide-react';
import Link from 'next/link';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

interface DashboardStats {
  totalRuns: number;
  monthlyRuns: number;
  monthlyLimit: number;
  totalCost: number;
  avgCostPerRun: number;
  avgLatency: number;
  totalTokens: number;
  successRate: number;
  plan: string;
  savings: {
    total: number;
    smartRouting: number;
    caching: number;
    routedCount: number;
    roi: number;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });

    // Check if user has existing API keys
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => {
        if (data.apiKeys && data.apiKeys.length > 0) {
          setApiKey('existing'); // Flag that key exists
        }
      });
  }, []);

  const generateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const res = await fetch('/api/keys/generate', { method: 'POST' });
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        // SOC 2: Do NOT store in localStorage (security risk)
        // Key shown only once, then gone forever
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
      alert('Failed to generate API key. Please try again.');
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const percentUsed = stats ? (stats.monthlyRuns / stats.monthlyLimit) * 100 : 0;
  const isNearLimit = percentUsed > 80;

  return (
    <>
      <WelcomeModal user={user ? {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.emailAddresses[0]?.emailAddress || '',
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      } : null} />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Track your AI costs and optimize spending</p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Link href="/analytics">
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Start Widget */}
      {!apiKey ? (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Key className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">🚀 Get Started in 2 Minutes</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your API key and start saving 50-80% on AI costs automatically.
                </p>
                <Link href="/settings">
                  <Button size="lg">
                    Generate API Key
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : apiKey === 'existing' ? (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Key className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">🔑 API Keys Active</h3>
                <p className="text-muted-foreground mb-4">
                  Your API keys are ready. Manage them in settings or generate a new one.
                </p>
                <Link href="/settings">
                  <Button size="lg" variant="outline">
                    Manage API Keys
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-600 dark:text-red-500">
                ⚠️ IMPORTANT: Save this key now. For security, you will not see it again.
              </p>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">🎉 Quick Start - Copy & Run</h3>
            
            {/* API Key */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Your API Key</label>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border rounded-lg text-sm font-mono">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Code Example */}
            <div>
              <label className="text-sm font-medium mb-2 block">Install & Use</label>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono space-y-2">
                <div className="text-gray-400"># Install SDK</div>
                <div>npm install promptcraft-sdk</div>
                <div className="text-gray-400 mt-4"># Use in your code</div>
                <div>import OpenAI from 'openai';</div>
                <div>import PromptCraft from 'promptcraft-sdk';</div>
                <div className="mt-2">const openai = new OpenAI();</div>
                <div>const promptcraft = new PromptCraft({'{'}</div>
                <div>  apiKey: '{apiKey}'</div>
                <div>{'}'});</div>
                <div className="mt-2">const tracked = promptcraft.wrapOpenAI(openai);</div>
                <div className="mt-2 text-gray-400">// Use exactly like normal OpenAI!</div>
                <div>const result = await tracked.chat.completions.create({'{'}</div>
                <div>  model: 'gpt-4',</div>
                <div>  messages: [{'{'} role: 'user', content: 'Hello!' {'}'}]</div>
                <div>{'}'});</div>
                <div className="mt-2 text-green-400">// ✅ Smart routing saves 30-60% automatically!</div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => copyToClipboard(`npm install promptcraft-sdk

import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

const openai = new OpenAI();
const promptcraft = new PromptCraft({ apiKey: '${apiKey}' });
const tracked = promptcraft.wrapOpenAI(openai);

const result = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});`)}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Banner */}
      {stats && stats.savings?.total > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">💰 Real Savings This Month</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-500 mb-2">
                  ${stats.savings.total.toFixed(2)}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Smart Routing: ${stats.savings.smartRouting.toFixed(2)} ({stats.savings.routedCount} prompts)</span>
                  <span>Caching: ${stats.savings.caching.toFixed(2)}</span>
                </div>
              </div>
              {stats.plan === 'FREE' && stats.savings.total > 50 && (
                <div className="text-right">
                  <p className="text-sm font-medium mb-2">Upgrade to Pro and save 2x more!</p>
                  <Link href="/pricing">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Upgrade to Pro - Save $500+/month
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Banner - Show if near limit or on free plan */}
      {stats && (isNearLimit || stats.plan === 'FREE') && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  <h2 className="text-xl font-bold">
                    {isNearLimit ? 'Running Low on Runs' : 'Upgrade to Track More'}
                  </h2>
                </div>
                <p className="text-blue-100">
                  {isNearLimit 
                    ? `You've used ${stats.monthlyRuns.toLocaleString()} of ${stats.monthlyLimit.toLocaleString()} runs this month.`
                    : `You're on the ${stats.plan} plan. Upgrade for unlimited tracking.`
                  }
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>100k+ runs/month</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Cost optimization</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Advanced analytics</span>
                  </div>
                </div>
              </div>
              <Link href="/pricing">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tracked Runs"
            value={`${(stats.monthlyRuns || 0).toLocaleString()}/${stats.monthlyLimit === -1 ? '∞' : (stats.monthlyLimit || 0).toLocaleString()}`}
            icon={<Activity className="w-4 h-4 text-blue-600" />}
            subtitle="This month"
          />
          <StatCard
            title="Total Cost"
            value={`$${(stats.totalCost || 0).toFixed(2)}`}
            icon={<DollarSign className="w-4 h-4 text-green-600" />}
            subtitle="All time"
          />
          <StatCard
            title="Avg Cost/Run"
            value={`$${(stats.avgCostPerRun || 0).toFixed(4)}`}
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            subtitle="Per API call"
          />
          <StatCard
            title="Success Rate"
            value={`${(stats.successRate || 0).toFixed(1)}%`}
            icon={<BarChart3 className="w-4 h-4 text-orange-600" />}
            subtitle={`${stats.totalRuns} total runs`}
          />
        </div>
      ) : (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Failed to load stats</p>
                <p className="text-sm text-red-700">Please refresh the page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Show if no runs */}
      {stats && stats.totalRuns === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 Get Started in 2 Minutes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Step number={1} title="Install SDK" completed={false}>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">npm install promptcraft-sdk</code>
              </Step>
              <Step number={2} title="Get API Key" completed={false}>
                <Link href="/settings" className="text-blue-600 hover:underline text-sm">
                  Go to Settings → Create API Key
                </Link>
              </Step>
              <Step number={3} title="Add to Your Code" completed={false}>
                <Link href="/docs/quickstart" className="text-blue-600 hover:underline text-sm">
                  View Quick Start Guide →
                </Link>
              </Step>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity - Show if has runs */}
      {stats && stats.totalRuns > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Tokens Used</span>
              <span className="font-semibold">{stats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-semibold">{Math.round(stats.avgLatency)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Plan</span>
              <span className="font-semibold">{stats.plan}</span>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string; value: string; icon: React.ReactNode; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function Step({ number, title, completed, children }: { number: number; title: string; completed: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-between text-sm font-bold ${completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {number}
      </div>
      <div className="flex-1">
        <p className="font-medium mb-1">{title}</p>
        {children}
      </div>
    </div>
  );
}
