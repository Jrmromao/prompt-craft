'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';

interface UserPlan {
  name: string;
  status: string;
  periodEnd?: Date;
}

const plans = [
  {
    name: 'FREE',
    description: 'Perfect for trying out PromptCraft',
    price: 0,
    credits: 10,
    features: [
      '1,000 tokens per month',
      'Basic prompt types',
      'No saving prompts',
      'No prompt history',
    ],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'LITE',
    description: 'For regular users who need more power',
    price: 3,
    credits: 250,
    features: [
      '25,000 tokens per week',
      'Save up to 50 prompts',
      'Prompt history',
      'Pre-made prompt templates',
      'Weekly credit reset',
    ],
    buttonText: 'Subscribe Weekly',
    popular: true,
  },
  {
    name: 'PRO',
    description: 'For power users and professionals',
    price: 12,
    credits: 1500,
    features: [
      '150,000 tokens per month',
      'Unlimited saved prompts',
      'Share prompts',
      'Community prompt library',
      'Priority support',
      'Monthly credit reset',
    ],
    buttonText: 'Subscribe Monthly',
    popular: false,
  },
];

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const response = await fetch('/api/subscription/current');
        if (response.ok) {
          const data = await response.json();
          setCurrentPlan(data);
        }
      } catch (error) {
        console.error('Error fetching current plan:', error);
      } finally {
        setIsLoadingPlan(false);
      }
    };

    if (user) {
      fetchCurrentPlan();
    }
  }, [user]);

  const handleSubscribe = async (planName: string) => {
    if (currentPlan?.name === planName) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    setIsLoading(planName);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <Button
          variant="ghost"
          className="mb-8 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              Simple, Transparent Pricing
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that's right for you
          </p>
          {currentPlan && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <CheckCircle2 className="h-5 w-5" />
              <span>
                Current Plan: {currentPlan.name}
                {currentPlan.periodEnd && (
                  <span className="ml-2 text-sm">
                    (Renews {format(new Date(currentPlan.periodEnd), 'yyyy-MM-dd')})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {plans.map(plan => {
            const isCurrentPlan = currentPlan?.name === plan.name;
            return (
              <Card
                key={plan.name}
                className={`flex flex-col transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10'
                    : 'border-gray-200 dark:border-gray-800'
                } ${isCurrentPlan ? 'ring-2 ring-purple-500' : ''}`}
              >
                <CardHeader>
                  {plan.popular && (
                    <div className="w-fit rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-sm font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="mt-4 text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {plan.price > 0 ? (plan.name === 'LITE' ? '/week' : '/month') : ''}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(feature => (
                      <li
                        key={feature}
                        className="flex items-center text-gray-600 dark:text-gray-300"
                      >
                        <Check className="mr-2 h-4 w-4 text-purple-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      isCurrentPlan
                        ? 'cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        : plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20'
                    }`}
                    variant={isCurrentPlan ? 'ghost' : plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={isLoading === plan.name || isCurrentPlan}
                  >
                    {isLoading === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
