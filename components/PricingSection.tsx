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
    '10 AI-generated prompts',
    'Personal prompt library',
    'Basic prompt editor',
    'Export prompts',
    'Community support',
  ],
  PRO: [
    'Unlimited AI-generated prompts',
    'Personal prompt library',
    'Advanced prompt editor with AI optimization',
    'Prompt version control',
    'Advanced analytics dashboard',
    'Priority support',
    'Access to premium AI models (GPT-4, Claude)',
    'Export & import prompts',
    'Custom prompt templates',
  ],
};

// 2. Post-MVP features (for tooltip or coming soon note)
const postMVPFeatures = [
  'Team collaboration',
  'Custom Integrations',
  'White-label Solutions',
  'Dedicated Account Manager',
  'Advanced Security',
  'Compliance Features',
];

const subscriptionPlans = [
  {
    name: 'FREE',
    price: 0,
    description: 'Perfect for trying AI prompt generation',
    features: coreFeatures.FREE,
    popular: false,
    isEnterprise: false,
    cta: 'Start Free',
  },
  {
    name: 'PRO',
    price: 29.99,
    description: 'For professionals and power users',
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
            Start free with 10 AI-generated prompts. Upgrade for unlimited access.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm", !isAnnual && "text-blue-600 font-semibold")}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={cn("text-sm", isAnnual && "text-blue-600 font-semibold")}>Annual <span className="text-green-500">(Save 15%)</span></span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-32">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col shadow-lg hover:shadow-xl",
                plan.isEnterprise
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80",
                plan.popular && "ring-2 ring-blue-500 scale-105"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-md border border-blue-200 dark:border-blue-800">
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
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={cn(
                  "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 mt-auto shadow-lg hover:shadow-xl transform hover:scale-105",
                  plan.name === 'FREE'
                    ? "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:bg-black dark:hover:bg-blue-950/20"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700"
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        {/* See all features link */}
        <div className="text-center mt-8">
          <a href="#" className="text-blue-600 underline hover:text-blue-800 text-sm">See all features</a>
        </div>
        
        {/* Credit Purchase Options */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Need More Credits?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Purchase additional credits that never expire. Perfect for heavy usage or one-time projects.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
              <h4 className="text-lg font-semibold mb-2">Starter Pack</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">100 Credits</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">$4.99</div>
              <div className="text-sm text-gray-500">$0.05 per credit</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-500 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Best Value</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Power Pack</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">500 Credits</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">$19.99</div>
              <div className="text-sm text-gray-500">$0.04 per credit</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
              <h4 className="text-lg font-semibold mb-2">Pro Pack</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000 Credits</div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">$34.99</div>
              <div className="text-sm text-gray-500">$0.035 per credit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 