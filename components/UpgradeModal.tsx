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
import { useToast } from '@/components/ui/use-toast';
import { Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: PlanType, period: Period) => void;
  currentPlan?: PlanType;
  missingCredits?: number;
}

const plans = [
  {
    type: PlanType.PRO,
    name: 'Pro Plan',
    price: 19,
    features: [
      '20 Private Prompts',
      '500 Testing Runs/month',
      'Advanced Analytics',
      'Priority Support',
      'Custom Templates',
      'Team Collaboration (up to 3 users)',
      'API Access',
      'Version Control',
      'Performance Metrics',
      'Pay-as-you-go Credits: $0.06/credit',
      'BYOK (Bring Your Own Key)'
    ]
  },
  {
    type: PlanType.ELITE,
    name: 'Elite Plan',
    price: 49,
    features: [
      'Unlimited Private Prompts',
      'Unlimited Testing Runs',
      'Advanced AI Parameters',
      'Team Collaboration (up to 10 users)',
      'Custom Integrations',
      'Advanced Analytics',
      'Priority Support',
      'Custom Model Fine-tuning',
      'White-label Solutions',
      'SLA Guarantee',
      'Unlimited credits included',
      'BYOK (Bring Your Own Key)'
    ]
  }
];

export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentPlan,
  missingCredits,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<PlanType>(PlanType.PRO);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleUpgrade = async (planType: PlanType) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {plans.map(plan => (
            <div
              key={plan.type}
              className={`relative rounded-lg border p-4 ${
                selectedPlan === plan.type ? 'border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${plan.price}/month
                  </p>
                </div>
                <Button
                  onClick={() => handleUpgrade(plan.type)}
                  disabled={isLoading}
                  variant={selectedPlan === plan.type ? 'default' : 'outline'}
                >
                  {isLoading ? 'Processing...' : 'Upgrade'}
                </Button>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
