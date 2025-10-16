'use client';

import { useState } from 'react';
import { Lock, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FeaturePreviewProps {
  feature: string;
  requiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  currentPlan: string;
  previewValue: string | number;
  children: React.ReactNode;
}

export function FeaturePreview({ feature, requiredPlan, currentPlan, previewValue, children }: FeaturePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  const planHierarchy = { FREE: 0, TRIAL: 0, STARTER: 1, PRO: 2, ENTERPRISE: 3 };
  const isLocked = planHierarchy[currentPlan as keyof typeof planHierarchy] < planHierarchy[requiredPlan];

  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <div className="blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg">
          <Lock className="w-8 h-8 text-gray-600" />
        </div>

        {showPreview && (
          <div className="absolute z-50 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-purple-500 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Preview: {feature}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This feature would show: <strong className="text-purple-600">{previewValue}</strong>
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-3 rounded-lg mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                  {requiredPlan} Plan Required
                </span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Unlock this and 10+ other features
              </p>
            </div>

            <Link href="/pricing">
              <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                Upgrade to {requiredPlan}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
