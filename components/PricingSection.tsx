'use client'
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Feature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
    <span className="text-sm">{children}</span>
  </li>
);

const MissingFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-gray-400">
    <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
    <span className="text-sm">{children}</span>
  </li>
);

export default function PricingSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Save 70-95% on AI Costs</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you're saving hundreds per month. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-2">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-2">$0</div>
              <p className="text-gray-600 text-sm">Forever free</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Optimize up to <strong>$100/month</strong> in AI costs
            </p>
            <ul className="space-y-2 mb-6">
              <Feature>OpenAI cost optimization</Feature>
              <Feature>Anthropic (Claude) support</Feature>
              <Feature>Basic analytics</Feature>
              <Feature>7-day retention</Feature>
              <MissingFeature>Advanced caching</MissingFeature>
              <MissingFeature>Email alerts</MissingFeature>
            </ul>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/sign-up">Start Free</Link>
            </Button>
          </div>

          {/* Starter */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-green-200 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Best Value
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-2">$9</div>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Optimize up to <strong>$500/month</strong> in AI costs
            </p>
            <ul className="space-y-2 mb-6">
              <Feature>Everything in Free</Feature>
              <Feature>Advanced model routing</Feature>
              <Feature>Response caching (40% savings)</Feature>
              <Feature>30-day retention</Feature>
              <Feature>Email alerts</Feature>
              <Feature>Savings reports</Feature>
            </ul>
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
            <p className="text-center text-xs text-green-600 font-semibold mt-3">
              💰 Save $50-150/month = 5-15x ROI
            </p>
          </div>

          {/* Pro */}
          <div className="bg-blue-600 text-white rounded-lg p-6 shadow-lg relative scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-2">$29</div>
              <p className="text-blue-100 text-sm">per month</p>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              Optimize up to <strong>$2,000/month</strong> in AI costs
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Everything in Starter</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Automatic prompt optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Multi-provider support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Quality monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />
                <span className="text-sm">Team (5 users)</span>
              </li>
            </ul>
            <Button className="w-full bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
            <p className="text-center text-xs text-blue-100 font-semibold mt-3">
              💰 Save $300-600/month = 10x+ ROI
            </p>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-2">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-2">Custom</div>
              <p className="text-gray-600 text-sm">Contact us</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Unlimited</strong> AI cost optimization
            </p>
            <ul className="space-y-2 mb-6">
              <Feature>Everything in Pro</Feature>
              <Feature>SSO (SAML)</Feature>
              <Feature>Dedicated support</Feature>
              <Feature>Custom integrations</Feature>
              <Feature>Unlimited users</Feature>
              <Feature>SLA guarantee</Feature>
            </ul>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
              <Link href="mailto:sales@costlens.dev">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
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