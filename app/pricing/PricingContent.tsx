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
import { PlanType, PLANS } from '../constants/plans';

interface UserPlan {
  name: string;
  status: string;
  periodEnd?: Date;
}

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  isEnterprise: boolean;
  stripeProductId: string;
  stripePriceId: string;
  stripeAnnualPriceId: string;
  limits: {
    tokens: number;
  };
}

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

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

  const handlePlanSelect = (planId: PlanType) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (currentPlan?.name === plan.name) {
      toast.info('You are already subscribed to this plan');
      return;
    }
    setSelectedPlan(planId);
    setShowComparison(true);
  };

  const handleSubscribe = async (planId: PlanType) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setIsLoading(planId.toString());
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          planId,
          stripePriceId: isAnnual ? plan.stripeAnnualPriceId : plan.stripePriceId,
          period: isAnnual ? 'yearly' : 'monthly'
        }),
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
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    if (!currentPlanData || !selectedPlanData) return null;

    const currentFeatures = new Set(currentPlanData.features);
    const selectedFeatures = new Set(selectedPlanData.features);

    const addedFeatures = selectedPlanData.features.filter(f => !currentFeatures.has(f));
    const removedFeatures = currentPlanData.features.filter(f => !selectedFeatures.has(f));

    return {
      addedFeatures,
      removedFeatures,
      priceChange: selectedPlanData.price.monthly - currentPlanData.price.monthly,
      benefits: selectedPlanData.features
    };
  };

  const comparison = getPlanComparison();

  const getDisplayPrice = (plan: Plan) => {
    if (plan.isEnterprise) return 'Custom';
    if (plan.id === PlanType.FREE) return 'Free';
    return isAnnual 
      ? `$${plan.price.annual}`
      : `$${plan.price.monthly}`;
  };

  const getMonthlyPrice = (plan: Plan) => {
    if (plan.isEnterprise || plan.id === PlanType.FREE) return '';
    return `$${plan.price.monthly}/month when billed monthly`;
  };

  const getTokenDisplay = (plan: Plan) => {
    return `${plan.limits.tokens.toLocaleString()} tokens/month`;
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
                      ${comparison.priceChange.toFixed(2)}/{selectedPlan === PlanType.PRO ? 'week' : 'month'}
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
                disabled={isLoading === selectedPlan?.toString()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading === selectedPlan?.toString() ? (
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
          {isLoadingPlans ? (
            <div className="col-span-3 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            plans.map(plan => {
              const isCurrentPlan = currentPlan?.name === plan.name;
              const displayPrice = getDisplayPrice(plan);
              const monthlyPrice = getMonthlyPrice(plan);
              const tokenDisplay = getTokenDisplay(plan);
              
              return (
                <Card
                  key={plan.id}
                  className={`group relative flex flex-col transition-all duration-300 hover:scale-105 ${
                    plan.id === PlanType.PRO
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10'
                      : 'border-gray-200 dark:border-gray-800'
                  } ${isCurrentPlan ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.id === PlanType.PRO && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 text-white">
                        Most Popular
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
                        {!plan.isEnterprise && plan.id !== PlanType.FREE && (
                          <span className="text-gray-600 dark:text-gray-300">
                            /{isAnnual ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                      {isAnnual && monthlyPrice && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {monthlyPrice}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {tokenDisplay}
                        </span>
                      </div>
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
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isLoading === plan.id.toString()}
                      className={`w-full ${
                        plan.id === PlanType.PRO
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'border-2 border-purple-600 bg-white text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {isLoading === plan.id.toString() ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.isEnterprise ? (
                        'Contact Sales'
                      ) : (
                        'Start Free Trial'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
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
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">How does token usage work?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each plan includes a monthly token allowance that resets at the beginning of your billing cycle. Tokens are used for all AI operations - the more complex the operation, the more tokens it uses. Elite and Enterprise plans include unlimited tokens. You can purchase additional tokens at any time if you need more than your monthly allowance.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">What happens if I run out of tokens?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can purchase additional tokens at any time, or upgrade to a higher tier plan for a larger monthly token allowance. Elite and Enterprise plans include unlimited tokens. Basic features remain available even when you run out of tokens. Your token allowance will automatically reset at the start of your next billing cycle.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-2 font-medium">How many tokens do I need?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A typical prompt uses 100-500 tokens. The Free plan's 10,000 tokens are perfect for testing and small projects. The Pro plan's 100,000 tokens are ideal for regular usage at just $19/month. If you need more, the Elite plan offers 500,000 tokens for $49/month, or you can purchase additional tokens as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
