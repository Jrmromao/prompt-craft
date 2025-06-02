import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlanType, Period } from '@/utils/constants';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: PlanType, period: Period) => void;
  currentPlan?: PlanType;
  missingCredits?: number;
}

const PLANS = [
  {
    type: PlanType.LITE,
    name: 'Lite Plan',
    description: 'Perfect for casual users',
    features: [
      '250 credits per week',
      'Save up to 50 prompts',
      'Access to prompt templates',
      'DeepSeek API access',
    ],
    pricing: {
      [Period.WEEKLY]: 3,
      [Period.MONTHLY]: 12,
    },
  },
  {
    type: PlanType.PRO,
    name: 'Pro Plan',
    description: 'For power users and professionals',
    features: [
      '1,500 credits per month',
      'Unlimited saved prompts',
      'Access to all AI models',
      'Priority support',
      'Community prompt library',
    ],
    pricing: {
      [Period.MONTHLY]: 12,
    },
  },
];

export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentPlan,
  missingCredits,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<PlanType>(PlanType.LITE);
  const [selectedPeriod, setSelectedPeriod] = React.useState<Period>(Period.WEEKLY);

  const handleUpgrade = () => {
    onUpgrade(selectedPlan, selectedPeriod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {missingCredits
              ? `Need ${missingCredits} more credits?`
              : 'Upgrade Your Plan'}
          </DialogTitle>
          <DialogDescription>
            {missingCredits
              ? 'Upgrade your plan to get more credits and access to advanced features.'
              : 'Choose the plan that best fits your needs.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {PLANS.map((plan) => (
            <div
              key={plan.type}
              className={`rounded-lg border p-4 ${
                selectedPlan === plan.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <Button
                  variant={selectedPlan === plan.type ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.type)}
                >
                  Select
                </Button>
              </div>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {selectedPlan === plan.type && (
                <div className="mt-4">
                  {plan.type === PlanType.LITE && (
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPeriod === Period.WEEKLY ? 'default' : 'outline'}
                        onClick={() => setSelectedPeriod(Period.WEEKLY)}
                      >
                        Weekly (${plan.pricing[Period.WEEKLY]})
                      </Button>
                      <Button
                        variant={selectedPeriod === Period.MONTHLY ? 'default' : 'outline'}
                        onClick={() => setSelectedPeriod(Period.MONTHLY)}
                      >
                        Monthly (${plan.pricing[Period.MONTHLY]})
                      </Button>
                    </div>
                  )}
                  {plan.type === PlanType.PRO && (
                    <Button className="w-full" variant="default">
                      Monthly (${plan.pricing[Period.MONTHLY]})
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade}>
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 