'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface UserPlan {
  name: string;
  status: string;
  periodEnd?: Date;
}

const plans = [
  {
    name: 'Free',
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
    name: 'Lite',
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
    name: 'Pro',
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

export default function PricingPage() {
  const router = useRouter();
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
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

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
          className="mb-8 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that's right for you
          </p>
          {currentPlan && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                Current Plan: {currentPlan.name}
                {currentPlan.periodEnd && (
                  <span className="text-sm ml-2">
                    (Renews {new Date(currentPlan.periodEnd).toLocaleDateString()})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
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
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium px-3 py-1 rounded-full w-fit">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl mt-4">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {plan.price > 0 ? (plan.name === 'Lite' ? '/week' : '/month') : ''}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                        <Check className="h-4 w-4 text-purple-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                        : plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                          : 'border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
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