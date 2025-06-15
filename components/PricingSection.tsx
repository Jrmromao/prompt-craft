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

const postMVPFeatures = [
  'Team Collaboration (up to 3 users)',
  'Team Collaboration (up to 10 users)',
  'Custom Integrations',
  'Custom Model Fine-tuning',
  'White-label Solutions',
  'Custom AI Model Fine-tuning',
  'Dedicated Account Manager',
  'Custom API Integration',
  'Advanced Security',
  'Compliance Features',
  'Custom Training',
  'Custom Development',
];

const subscriptionPlans = [
  {
    name: 'FREE',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '3 Private Prompts',
      '100 Testing Runs/month',
      'Access to Public Prompts',
      'Basic Analytics',
      'Community Support',
      'Basic Prompt Templates',
      'Pay-as-you-go Credits: $0.08/credit (min. 100 credits)',
      'Uses DeepSeek & GPT-3.5 AI Models'
    ],
    popular: false,
    isEnterprise: false
  },
  {
    name: 'PRO',
    price: 19,
    description: 'For professionals and small teams',
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
      'Pay-as-you-go Credits: $0.06/credit (min. 500 credits)',
      'Uses DeepSeek & GPT-3.5 AI Models',
      'BYOK (Bring Your Own Key): Unlimited test runs with your own key'
    ],
    popular: true,
    isEnterprise: false
  },
  {
    name: 'ELITE',
    price: 49,
    description: 'For serious professionals and teams',
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
      'Uses Premium AI Model',
      'BYOK (Bring Your Own Key)'
    ],
    popular: false,
    isEnterprise: false
  },
  {
    name: 'ENTERPRISE',
    price: null,
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Elite',
      'Unlimited Team Members',
      'Custom AI Model Fine-tuning',
      'Dedicated Account Manager',
      'Custom API Integration',
      'Advanced Security',
      'Compliance Features',
      'Custom Training',
      'Custom Development',
      'SLA Guarantee',
      'Unlimited credits included',
      'Uses Premium AI Model (custom options available)',
      'BYOK (Bring Your Own Key',
    ],
    popular: false,
    isEnterprise: true
  }
];

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
            <span className={cn("text-sm", isAnnual && "text-purple-600 font-semibold")}>Annual <span className="text-green-500">(Save 20%)</span></span>
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
                      <span className="text-4xl font-bold">${((plan.price * 12 * 0.8) / 12).toFixed(2)}/mo</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Billed ${(plan.price * 12 * 0.8).toFixed(2)}/year (save 20%)</span>
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
                {plan.features.map((feature, index) =>
                  renderFeature(feature, postMVPFeatures.includes(feature), index)
                )}
              </ul>
              <button
                className={cn(
                  "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mt-auto",
                  plan.isEnterprise
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : plan.name === 'FREE'
                    ? "bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 dark:bg-black dark:hover:bg-purple-950/20"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                )}
              >
                {plan.isEnterprise 
                  ? "Contact Sales" 
                  : plan.name === 'FREE'
                  ? "Start Free Trial"
                  : "Start Free Trial"
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 