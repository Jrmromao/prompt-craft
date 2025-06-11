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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Sparkles, ArrowLeft, Loader2, CheckCircle2, X, Info, Star, Zap, Shield, Users, Clock, BarChart3, MessageSquare, Key, Settings, Lock, UserCog, Server, Workflow } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface UserPlan {
  name: string;
  status: string;
  periodEnd?: Date;
}

const plans = [
  {
    name: 'PRO',
    description: 'Perfect for individual prompt engineers and freelancers',
    price: 9.99,
    period: 'month',
    features: [
      '200 Testing Runs/month',
      'Up to 200 Private Prompts',
      'Access to Community Prompts',
      'Basic Analytics',
      'Email Support',
    ],
    benefits: [
      'Scale your prompt engineering workflow',
      'Save time with automated testing',
      'Learn from community best practices',
      'Track your prompt performance',
    ],
    highlight: 'Most Popular',
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'ELITE',
    description: 'For dedicated prompt engineers and professional content creators',
    price: 29.99,
    period: 'month',
    features: [
      'Unlimited Testing Runs',
      'Unlimited Private Prompts',
      'Advanced Analytics',
      'Bring Your Own API Key',
      'Priority Support',
      'Custom Integrations',
    ],
    benefits: [
      'Unlock unlimited potential',
      'Professional-grade analytics',
      'Customize your workflow',
      'Priority support for faster resolution',
      'Integrate with your existing tools',
    ],
    highlight: 'Best Value',
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'ENTERPRISE',
    description: 'Custom solutions for large organizations',
    price: 'Custom',
    period: 'month',
    features: [
      'Everything in Elite',
      'Custom AI Model Fine-tuning',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Custom API Integration',
      'Team Management',
      'Advanced Security',
    ],
    benefits: [
      'Enterprise-grade security',
      'Custom AI model optimization',
      'Dedicated support team',
      'Team collaboration features',
      'Advanced security controls',
    ],
    highlight: 'Custom',
    cta: 'Contact Sales',
    popular: false,
  }
];

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

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

  const handlePlanSelect = (planName: string) => {
    if (currentPlan?.name === planName) {
      toast.info('You are already subscribed to this plan');
      return;
    }
    setSelectedPlan(planName);
    setShowComparison(true);
  };

  const handleSubscribe = async (planName: string) => {
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
      setShowComparison(false);
    }
  };

  const getPlanComparison = () => {
    if (!selectedPlan || !currentPlan) return null;
    
    const currentPlanData = plans.find(p => p.name === currentPlan.name);
    const selectedPlanData = plans.find(p => p.name === selectedPlan);
    
    if (!currentPlanData || !selectedPlanData) return null;

    const currentFeatures = new Set(currentPlanData.features);
    const selectedFeatures = new Set(selectedPlanData.features);

    const addedFeatures = selectedPlanData.features.filter(f => !currentFeatures.has(f));
    const removedFeatures = currentPlanData.features.filter(f => !selectedFeatures.has(f));

    return {
      addedFeatures,
      removedFeatures,
      priceChange: typeof selectedPlanData.price === 'number' && typeof currentPlanData.price === 'number'
        ? selectedPlanData.price - currentPlanData.price
        : null,
      benefits: selectedPlanData.benefits
    };
  };

  const comparison = getPlanComparison();

  const getAnnualPrice = (price: number) => {
    return `$${(price * 12 * 0.8).toFixed(2)}`; // 20% discount for annual
  };

  const getFeatureIcon = (feature: string) => {
    // Testing related
    if (feature.includes('Testing')) return <Zap className="h-4 w-4 text-blue-500" />;
    if (feature.includes('Analytics')) return <BarChart3 className="h-4 w-4 text-indigo-500" />;
    
    // Security and Access
    if (feature.includes('Private')) return <Lock className="h-4 w-4 text-purple-500" />;
    if (feature.includes('Security')) return <Shield className="h-4 w-4 text-green-500" />;
    if (feature.includes('API Key')) return <Key className="h-4 w-4 text-orange-500" />;
    
    // Community and Support
    if (feature.includes('Community')) return <Users className="h-4 w-4 text-pink-500" />;
    if (feature.includes('Support')) return <MessageSquare className="h-4 w-4 text-cyan-500" />;
    
    // Enterprise features
    if (feature.includes('Custom')) return <Settings className="h-4 w-4 text-yellow-500" />;
    if (feature.includes('Team')) return <UserCog className="h-4 w-4 text-emerald-500" />;
    if (feature.includes('Integration')) return <Workflow className="h-4 w-4 text-violet-500" />;
    if (feature.includes('Model')) return <Server className="h-4 w-4 text-rose-500" />;
    
    // Default
    return <Check className="h-4 w-4 text-purple-500" />;
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

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                Annual
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="cursor-help">
                      Save 20%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get 2 months free with annual billing</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Plan Upgrade Preview</DialogTitle>
              <DialogDescription>
                Here's what will change when you upgrade to {selectedPlan}
              </DialogDescription>
            </DialogHeader>
            {comparison && (
              <div className="space-y-6 py-4">
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                  <h4 className="mb-3 font-medium text-purple-700 dark:text-purple-300">Why Upgrade to {selectedPlan}?</h4>
                  <ul className="space-y-2">
                    {comparison.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-purple-600 dark:text-purple-400">
                        <Sparkles className="mr-2 h-4 w-4 flex-shrink-0 text-purple-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {comparison.addedFeatures.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-green-600 dark:text-green-400">New Features</h4>
                    <ul className="space-y-2">
                      {comparison.addedFeatures.map(feature => (
                        <li key={feature} className="flex items-center text-sm">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {comparison.removedFeatures.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-red-600 dark:text-red-400">Removed Features</h4>
                    <ul className="space-y-2">
                      {comparison.removedFeatures.map(feature => (
                        <li key={feature} className="flex items-center text-sm">
                          <X className="mr-2 h-4 w-4 text-red-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {comparison.priceChange !== null && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-sm">
                      Price Change: {comparison.priceChange > 0 ? '+' : ''}
                      ${comparison.priceChange.toFixed(2)}/{selectedPlan === 'PRO' ? 'week' : 'month'}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowComparison(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubscribe(selectedPlan!)}
                disabled={isLoading === selectedPlan}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading === selectedPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Upgrade'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {plans.map(plan => {
            const isCurrentPlan = currentPlan?.name === plan.name;
            const displayPrice = typeof plan.price === 'number' 
              ? isAnnual 
                ? getAnnualPrice(plan.price)
                : `$${plan.price}`
              : plan.price;
            
            return (
              <Card
                key={plan.name}
                className={`group relative flex flex-col transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10'
                    : 'border-gray-200 dark:border-gray-800'
                } ${isCurrentPlan ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-white">
                      {plan.highlight}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="mt-4 text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
                        {displayPrice}
                      </span>
                      {typeof plan.price === 'number' && (
                        <span className="text-gray-600 dark:text-gray-300">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {isAnnual && typeof plan.price === 'number' && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        ${plan.price}/month when billed monthly
                      </p>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(feature => (
                      <li
                        key={feature}
                        className="flex items-start text-gray-600 dark:text-gray-300"
                      >
                        <div className="mt-0.5">
                          {getFeatureIcon(feature)}
                        </div>
                        <span className="ml-2">{feature}</span>
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
                    onClick={() => handlePlanSelect(plan.name)}
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
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-4 text-left">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">Can I change plans later?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">Is there a free trial?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, all paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
