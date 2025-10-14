'use client';

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Clock, TrendingUp, Check, X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: 'playground' | 'versions' | 'prompts';
}

export function UpgradeModal({ open, onOpenChange, trigger }: UpgradeModalProps) {
  const triggerMessages = {
    playground: {
      title: "🚀 Unlock the Playground",
      subtitle: "Test prompts instantly and save hours of manual work"
    },
    versions: {
      title: "📚 Unlimited Versions",
      subtitle: "Never lose track of your prompt iterations again"
    },
    prompts: {
      title: "⚡ Unlimited Prompts", 
      subtitle: "Build your complete prompt library without limits"
    }
  };

  const message = triggerMessages[trigger];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
            <p className="text-gray-600">{message.subtitle}</p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Proof */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm text-green-800">
              <strong>1,247 professionals</strong> upgraded this month
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {[
              'Unlimited prompts & versions',
              'Advanced playground access', 
              'Priority AI models',
              'Export & sharing tools',
              'Priority support'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">$35</div>
            <div className="text-sm text-blue-700">per month</div>
            <div className="text-xs text-blue-600 mt-1">Cancel anytime • 7-day guarantee</div>
          </div>

          {/* CTA */}
          <Button 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700 font-semibold text-lg"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade to PRO Now
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-gray-500"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
