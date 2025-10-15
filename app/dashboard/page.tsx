'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, DollarSign, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Track your AI costs and optimize spending</p>
        </div>
        <Link href="/analytics">
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Conversion Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6" />
                <h2 className="text-xl font-bold">Upgrade to Track More</h2>
              </div>
              <p className="text-blue-100">
                You're on the Free plan (1,000 runs/month). Upgrade for unlimited tracking.
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
              <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6">
                Upgrade to Pro - $29/month
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">Tracked runs</p>
            <div className="mt-2 text-xs text-blue-600">0 / 1,000 used</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-500">AI spending</p>
            <div className="mt-2 text-xs text-green-600">↓ 0% vs last month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Cost/Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-500">Per API call</p>
            <div className="mt-2 text-xs text-gray-400">No data yet</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-500">Successful calls</p>
            <div className="mt-2 text-xs text-gray-400">No data yet</div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">1. Install the SDK</h3>
              <p className="text-sm text-gray-600 mb-2">
                Add our SDK to your project to start tracking API calls
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                npm install promptcraft-sdk
              </code>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">2. Track Your First Run</h3>
              <p className="text-sm text-gray-600 mb-2">
                Wrap your OpenAI or Anthropic calls to start tracking costs
              </p>
              <Link href="/settings" className="text-sm text-blue-600 hover:underline">
                Get your API key →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="bg-blue-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">3. Set Budget Alerts</h3>
              <p className="text-sm text-gray-600 mb-2">
                Get notified before you exceed your spending limits
              </p>
              <Link href="/settings" className="text-sm text-blue-600 hover:underline">
                Configure alerts →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
