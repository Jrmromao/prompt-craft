'use client'
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Helper to render features, underlining post-MVP ones
function renderFeature(feature: string, isPostMVP: boolean, index: number) {
  if (isPostMVP) {
    return (
      <li key={index} className="flex items-center gap-3">
        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
        <span
          className="underline decoration-dashed decoration-2 underline-offset-2 text-gray-500 cursor-help"
          title="Coming Soon"
        >
          {feature}
        </span>
      </li>
    );
  }
  return (
    <li key={index} className="flex items-center gap-3">
      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span>{feature}</span>
    </li>
  );
}

// 1. Define core features for each plan (lean, conversion-focused)
const coreFeatures = {
  FREE: [
    '100 credits/month (resets monthly, does not accumulate)',
    'Buy extra credits (never expire)',
    'Earn credits from upvotes (never expire)',
    {
      label: 'Up to 3 private prompts',
      note: 'If your prompts are large, your monthly credits may not cover all 3.'
    },
    'Create public prompts',
    'No version control',
    'Run prompt tests until credits are used',
  ],
  PRO: [
    '500 credits/month (resets monthly, does not accumulate)',
    'Buy extra credits at a lower rate (never expire)',
    'Earn bonus credits from upvotes (never expire)',
    {
      label: 'Up to 20 private prompts',
      note: 'More room for your best ideas—credit usage still applies.'
    },
    'Unlimited public prompts',
    'Prompt version control',
    'Advanced analytics',
    'Priority support',
    'Run prompt tests until credits are used',
  ],
  ELITE: [
    'Unlimited credits (no monthly cap)',
    'Unlimited private prompts',
    'Unlimited public prompts',
    'Unlimited prompt tests',
    'Access to premium AI models',
    'Custom templates',
    'Advanced prompt version control',
    'Early access to new features',
    'Priority support',
    'Dedicated onboarding session',
    'SLA guarantee',
    'Max credit rewards for community engagement',
    'Exclusive community badge',
    'Advanced analytics & reporting',
  ],
};

// 2. Post-MVP features (for tooltip or coming soon note)
const postMVPFeatures = [
  'Team collaboration (up to 10 users)',
  'Custom Integrations',
  'White-label Solutions',
  'Dedicated Account Manager',
  'Advanced Security',
  'Compliance Features',
  'Custom Training',
  'Custom Development',
];

const subscriptionPlans = [
  {
    name: 'FREE',
    price: 0,
    description: 'Get started with the basics',
    features: coreFeatures.FREE,
    popular: false,
    isEnterprise: false,
    cta: 'Start Free',
  },
  {
    name: 'PRO',
    price: 15.99,
    description: 'For professionals and creators',
    features: coreFeatures.PRO,
    popular: true,
    isEnterprise: false,
    cta: 'Upgrade to Pro',
  },
];

// Update annual discount to 15%
const ANNUAL_DISCOUNT = 0.15;

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that best fits your needs
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm", !isAnnual && "text-purple-600 font-semibold")}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={cn("text-sm", isAnnual && "text-purple-600 font-semibold")}>Annual <span className="text-green-500">(Save 15%)</span></span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-32">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col",
                plan.isEnterprise
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500",
                plan.popular && "ring-2 ring-purple-500"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-md border border-purple-200 dark:border-purple-800">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-center">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{plan.description}</p>
                <div className="flex flex-col items-center justify-center gap-1">
                  {plan.price === null ? (
                    <>
                      <span className="text-4xl font-bold">Custom</span>
                    </>
                  ) : plan.name === 'FREE' ? (
                    <>
                      <span className="text-4xl font-bold">$0.00</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{isAnnual ? 'year' : 'month'}</span>
                    </>
                  ) : isAnnual ? (
                    <>
                      <span className="text-4xl font-bold">${((plan.price * 12 * (1 - ANNUAL_DISCOUNT)) / 12).toFixed(2)}/mo</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Billed ${(plan.price * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)}/year (save 15%)</span>
                      <span className="text-xs text-gray-400">Original: ${(plan.price).toFixed(2)}/mo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${plan.price.toFixed(2)}/mo</span>
                    </>
                  )}
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => {
                  if (typeof feature === 'string') {
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    );
                  }
                  // For features with a note (object)
                  return (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>
                        {feature.label}
                        <span
                          className="ml-2 text-gray-400 cursor-help underline decoration-dashed decoration-2 underline-offset-2"
                          title={feature.note}
                        >
                          (i)
                        </span>
                      </span>
                    </li>
                  );
                })}
                {/* Show a tooltip or note for post-MVP features */}
                {plan.name === 'ELITE' && (
                  <li className="flex items-center gap-3 mt-2">
                    <Check className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 cursor-help underline decoration-dashed decoration-2 underline-offset-2" title={postMVPFeatures.join(', ')}>
                      + More features coming soon
                    </span>
                  </li>
                )}
              </ul>
              <button
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mt-auto",
                  plan.name === 'FREE'
                    ? "bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 dark:bg-black dark:hover:bg-purple-950/20"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        {/* See all features link */}
        <div className="text-center mt-8">
          <a href="#" className="text-purple-600 underline hover:text-purple-800 text-sm">See all features</a>
        </div>
      </div>
    </section>
  );
} 