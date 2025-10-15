import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLANS } from '@/app/constants/plans';
import { Check, ChevronRight, Sparkles, Zap, Shield, Users } from 'lucide-react';

// Billing cycles and discounts
const BILLING_CYCLES = [
  { label: 'Monthly', value: 'monthly', discount: 0 },
  { label: 'Annual', value: 'yearly', discount: 0.21 }, // 21% savings
];

// Social proof data
const SOCIAL_PROOF = {
  userCount: '10,000+',
  guarantee: '30-day money-back guarantee',
  support: 'Email & chat support',
};

interface UpgradeAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: (plan: any) => void;
}

export function UpgradeAccountDialog({ open, onOpenChange, onUpgrade }: UpgradeAccountDialogProps) {
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>('monthly');

  // Compute plans for selected billing
  const planList = React.useMemo(() => {
    // Only show Free and Pro plans
    return Object.values(PLANS)
      .filter((plan: any) => plan.id === 'FREE' || plan.id === 'PRO')
      .map((plan: any) => {
        // Calculate price and credits for billing cycle
        let price = 0;
        let credits = 0;
        let billingLabel = '';
        let effectiveMonthlyPrice = 0;
        
        if (billing === 'monthly') {
          price = plan.price.monthly;
          credits = plan.credits.included;
          billingLabel = 'month';
          effectiveMonthlyPrice = price;
        } else if (billing === 'yearly') {
          price = plan.price.annual;
          credits = plan.credits.included * 12;
          billingLabel = 'year';
          effectiveMonthlyPrice = Math.round((price / 12) * 100) / 100; // Clean monthly equivalent
        }

        return {
          ...plan,
          price: Math.round(price * 100) / 100, // Ensure clean pricing
          credits,
          billingLabel,
          effectiveMonthlyPrice,
          isBestValue: plan.id === 'PRO',
        };
      });
  }, [billing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-0 bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header Section */}
        <DialogHeader className="relative px-6 pt-4 pb-2 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-blue-50/40 to-white dark:from-blue-950/20 dark:via-blue-950/10 dark:to-slate-900" />
          <div className="relative">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-4 font-inter">
              Choose Your Plan
            </DialogTitle>
            
            {/* Billing Toggle - Centered */}
            <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl max-w-fit mx-auto">
              <button
                onClick={() => setBilling('monthly')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[100px]',
                  billing === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                Monthly
              </button>
              <div className="relative">
                <button
                  onClick={() => setBilling('yearly')}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[100px]',
                    billing === 'yearly'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  Annual
                </button>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse shadow-lg">
                  Save 21%
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Plans Grid */}
        <div className="px-6 pb-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {planList.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isBestValue={plan.isBestValue}
                onSelect={() => onUpgrade(plan)}
                isLoading={false}
                billing={billing}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 text-center">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Cancel anytime, no questions asked</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Need help? <button className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced plan card with better visual hierarchy
function PlanCard({ plan, isBestValue, onSelect, isLoading, billing }: any) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl p-6 transition-all duration-300 ease-out cursor-pointer group h-full',
        'bg-white dark:bg-gray-900 border-2 shadow-lg hover:shadow-xl',
        isBestValue 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50/50 to-blue-50/30 dark:from-blue-950/20 dark:to-blue-950/10 scale-[1.02] shadow-xl ring-2 ring-blue-500/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:scale-[1.01]',
        plan.isCurrent && 'opacity-60 cursor-not-allowed'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!plan.isCurrent ? onSelect : undefined}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg font-inter flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Best Value
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {plan.isCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg font-inter">
            Current Plan
          </div>
        </div>
      )}

      {/* Plan Icon */}
      <div className="flex items-center justify-center mb-6">
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg',
          plan.id === 'FREE' 
            ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
            : 'bg-gradient-to-br from-blue-500 to-blue-500 group-hover:from-blue-600 group-hover:to-blue-500'
        )}>
          {plan.id === 'FREE' ? (
            <Sparkles className="h-7 w-7 text-gray-600 dark:text-gray-400" />
          ) : (
            <Zap className="h-7 w-7 text-white" />
          )}
        </div>
      </div>

      {/* Plan Name & Description */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-inter">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            ${billing === 'yearly' ? plan.effectiveMonthlyPrice : plan.price}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            /{billing === 'yearly' ? 'month' : plan.billingLabel}
          </span>
        </div>
        {billing === 'yearly' && plan.price > 0 && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            Billed ${plan.price} annually
          </div>
        )}
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {plan.credits.toLocaleString()} credits included
        </div>
      </div>

      {/* Features List */}
      <div className="flex-1 mb-8">
        <ul className="space-y-3">
          {plan.features.slice(0, 3).map((feature: any, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white font-inter">
                  {feature.name}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-inter leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onSelect}
        disabled={isLoading || plan.isCurrent}
        className={cn(
          'w-full h-12 text-sm font-bold transition-all duration-300 font-inter',
          plan.isCurrent
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : plan.id === 'FREE'
            ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-blue-950/20 hover:scale-105'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : plan.isCurrent ? (
          'Current Plan'
        ) : (
          <div className="flex items-center gap-2">
            {plan.id === 'FREE' ? 'Get Started Free' : 'Upgrade Now'}
            <ChevronRight className={cn(
              'h-4 w-4 transition-transform duration-300',
              isHovered && 'transform translate-x-1'
            )} />
          </div>
        )}
      </Button>
    </div>
  );
} 