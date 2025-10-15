'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SubscriptionStatus, Plan } from '@prisma/client';
import { RealtimeUsageDisplay } from '@/components/usage/RealtimeUsageDisplay';

// Define Period enum locally since it's not exported from @prisma/client
enum Period {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

interface SubscriptionWithPlan {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  plan: Plan;
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const selectedPlan = searchParams.get('plan');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (!response.ok) throw new Error('Failed to create subscription');

      const data = await response.json();
      window.location.href = data.url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscription/${subscription.id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      await fetchSubscription();
      toast({
        title: 'Success',
        description: 'Your subscription will be canceled at the end of the billing period',
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">Billing & Subscription</h1>

        {subscription && subscription.plan ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  {subscription.plan.name} - ${subscription.plan.price}
                  {subscription.plan.period === Period.WEEKLY ? '/week' : '/month'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">{subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(subscription.currentPeriodEnd), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Features</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {subscription.plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {subscription.status === SubscriptionStatus.ACTIVE && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            <div className="mt-8">
              <RealtimeUsageDisplay 
                title="Real-time Usage"
                showProgress={true}
                className="w-full"
              />
            </div>
          </>
        ) : selectedPlan ? (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                You're about to subscribe to the {selectedPlan} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click the button below to complete your subscription using Stripe.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubscribe} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>You don't have an active subscription</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push('/pricing')}>View Plans</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
