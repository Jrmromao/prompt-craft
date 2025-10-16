'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Zap, TrendingUp, Clock, X } from 'lucide-react';
import Link from 'next/link';

interface SmartUpgradeModalProps {
  trigger: 'limit_warning' | 'high_savings' | 'error_spike';
  currentPlan: string;
  data: {
    usagePercent?: number;
    potentialSavings?: number;
    errorRate?: number;
  };
}

export function SmartUpgradeModal({ trigger, currentPlan, data }: SmartUpgradeModalProps) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    // Show modal based on trigger conditions
    if (trigger === 'limit_warning' && data.usagePercent && data.usagePercent >= 80) {
      setOpen(true);
    } else if (trigger === 'high_savings' && data.potentialSavings && data.potentialSavings > 50) {
      setOpen(true);
    } else if (trigger === 'error_spike' && data.errorRate && data.errorRate > 10) {
      setOpen(true);
    }
  }, [trigger, data]);

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getContent = () => {
    switch (trigger) {
      case 'limit_warning':
        return {
          icon: <Clock className="w-12 h-12 text-red-600" />,
          title: `You've Used ${data.usagePercent}% of Your Limit`,
          description: 'Upgrade now to avoid service interruption. Your API calls will be paused when you hit 100%.',
          urgency: 'Limited Time: Upgrade in the next 10 minutes and get 20% off your first month',
          cta: 'Upgrade to Avoid Downtime'
        };
      case 'high_savings':
        return {
          icon: <TrendingUp className="w-12 h-12 text-green-600" />,
          title: `You Could Save $${data.potentialSavings?.toFixed(2)}/month`,
          description: 'Your usage pattern shows massive savings potential with Pro features. Other users like you save 60% on average.',
          urgency: 'Special Offer: Upgrade now and get your first month at 50% off',
          cta: 'Unlock My Savings'
        };
      case 'error_spike':
        return {
          icon: <Zap className="w-12 h-12 text-orange-600" />,
          title: 'Error Rate Spike Detected',
          description: 'Pro quality monitoring would have caught this earlier. Prevent revenue loss with real-time alerts.',
          urgency: 'Act Fast: Upgrade now to prevent future issues',
          cta: 'Upgrade to Pro Monitoring'
        };
    }
  };

  const content = getContent();
  const targetPlan = currentPlan === 'FREE' ? 'Starter' : 'Pro';
  const price = currentPlan === 'FREE' ? 19 : 49;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button 
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            {content.icon}
            <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            {content.description}
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                {content.urgency}
              </span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Offer expires soon
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Regular Price:</span>
              <span className="line-through text-muted-foreground">${price}/mo</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Special Offer:</span>
              <span className="text-green-600">${(price * 0.8).toFixed(0)}/mo</span>
            </div>
          </div>

          <Link href="/pricing" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" size="lg">
              <Zap className="w-4 h-4 mr-2" />
              {content.cta}
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
