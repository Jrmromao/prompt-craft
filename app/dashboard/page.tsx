'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Zap, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Ready to create amazing prompts?</p>
        </div>
      </div>

      {/* Conversion Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6" />
                <h2 className="text-xl font-bold">Unlock Your Full Potential</h2>
              </div>
              <p className="text-blue-100">
                Join 1,000+ professionals saving 10+ hours/week with PRO features
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>Unlimited everything</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Advanced playground</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>
            <Button 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Now - $35/month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-sm text-gray-600">Prompts Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">0</div>
            <div className="text-sm text-gray-600">Playground Runs</div>
            <div className="text-xs text-gray-500 mt-1">Upgrade to unlock</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-gray-600">Versions Used</div>
            <div className="text-xs text-gray-500 mt-1">1 remaining</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
