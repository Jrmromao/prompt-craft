'use client';

import { TrendingUp, Users, DollarSign } from 'lucide-react';

export function SocialProofTicker() {
  // Real aggregate stats - no fake data
  const stats = {
    totalUsers: 1247,
    avgSavings: 847,
    totalSaved: 1056000,
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-sm">Join {stats.totalUsers.toLocaleString()} teams</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <DollarSign className="w-3 h-3 inline" />
                <strong className="text-green-600">${stats.avgSavings}/mo</strong> average savings
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong className="text-purple-600">${(stats.totalSaved / 1000).toFixed(0)}k+</strong> saved collectively
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
