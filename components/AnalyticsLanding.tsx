'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, DollarSign, Zap, Shield, Users, TrendingDown, Check, AlertCircle, Clock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export default function AnalyticsLanding({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Join 500+ developers tracking $2M+ in AI costs
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Stop Wasting Money on<br />
              <span className="text-blue-600">OpenAI & Anthropic</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Most companies overspend 40% on AI because they can't see where the money goes.
            </p>
            <p className="text-xl font-semibold text-gray-900 mb-8 max-w-3xl mx-auto">
              Get real-time cost tracking + AI-powered optimization in 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 text-lg"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Tracking Free →
                  </Link>
                  <Link
                    href="#demo"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 text-lg"
                  >
                    Watch 2-Min Demo
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                No credit card
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                2-line setup
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-red-50 border-y border-red-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Sound Familiar?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ProblemCard
              title="Surprise Bills"
              description="Your OpenAI bill jumped from $500 to $3,000 and you have no idea why."
            />
            <ProblemCard
              title="No Visibility"
              description="You can't tell which prompts, models, or users are burning through your budget."
            />
            <ProblemCard
              title="Wasted Money"
              description="You're using GPT-4 when GPT-3.5 would work fine, costing 20x more."
            />
          </div>
        </div>
      </div>

      {/* Solution Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See Every Dollar, Save Thousands</h2>
          <p className="text-xl text-gray-600">Track costs in real-time and get instant optimization tips</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <StatCard number="2 min" label="Setup time" />
          <StatCard number="$0.001" label="Per tracked call" />
          <StatCard number="<50ms" label="Overhead" />
          <StatCard number="30-40%" label="Avg. savings" />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Control Costs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
              title="Real-Time Dashboard"
              description="See costs by prompt, model, user, and project. Know exactly where every dollar goes."
              benefit="Stop guessing, start knowing"
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8 text-blue-600" />}
              title="AI Cost Optimizer"
              description="Get instant suggestions: 'Switch to GPT-3.5 here and save $200/month' with one click."
              benefit="Reduce costs 30-40%"
            />
            <FeatureCard
              icon={<AlertCircle className="w-8 h-8 text-blue-600" />}
              title="Budget Alerts"
              description="Set spending limits. Get Slack/email alerts before you blow your budget."
              benefit="Never get surprised again"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-blue-600" />}
              title="Performance Tracking"
              description="Track latency and success rates. Find slow prompts costing you money."
              benefit="Faster = cheaper"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Team Analytics"
              description="See costs by developer, department, or project. Allocate budgets fairly."
              benefit="Full visibility"
            />
            <FeatureCard
              icon={<TrendingDown className="w-8 h-8 text-blue-600" />}
              title="Cost Forecasting"
              description="Predict next month's bill based on trends. Plan budgets with confidence."
              benefit="No more surprises"
            />
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by Developers at</h2>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
          <div className="text-2xl font-bold">YC Startups</div>
          <div className="text-2xl font-bold">AI Agencies</div>
          <div className="text-2xl font-bold">SaaS Companies</div>
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-gray-900 text-white py-16" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">2-Line Integration. Seriously.</h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            Add tracking to your existing code in under 2 minutes
          </p>
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-sm ml-2">your-app.ts</span>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code className="text-green-400">{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const openai = new OpenAI();
const params = { model: 'gpt-4', messages: [...] };

const start = Date.now();
const result = await openai.chat.completions.create(params);
`}</code>
              <code className="text-yellow-400">{`await promptcraft.trackOpenAI(params, result, Date.now() - start);`}</code>
              <code className="text-green-400">{`
// ✅ Done! All costs now tracked in real-time`}</code>
            </pre>
          </div>
          <p className="text-center text-gray-400 mt-6">
            Works with OpenAI and Anthropic • Zero performance impact • TypeScript support
          </p>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing That Scales With You</h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            features={["1,000 runs/mo", "7 days retention", "Basic analytics"]}
            cta="Start Free"
          />
          <PricingCard
            name="Starter"
            price="$9"
            features={["10,000 runs/mo", "30 days retention", "Cost optimization"]}
            cta="Start Free"
          />
          <PricingCard
            name="Pro"
            price="$29"
            features={["100,000 runs/mo", "90 days retention", "A/B testing"]}
            cta="Start Free"
            popular
          />
          <PricingCard
            name="Enterprise"
            price="$99"
            features={["Unlimited runs", "1 year retention", "Dedicated support"]}
            cta="Start Free"
          />
        </div>
        <p className="text-center text-gray-600 mt-8">
          All plans include 14-day free trial • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>

      {/* Final CTA */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Stop Wasting Money Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ developers who've saved thousands on their AI bills
          </p>
          {!user && (
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 text-lg shadow-lg"
            >
              Start Tracking Free <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <p className="text-sm mt-6 opacity-75">
            No credit card required • 2-minute setup • Free forever plan
          </p>
        </div>
      </div>
    </div>
  );
}

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-red-200">
      <h3 className="font-semibold text-lg mb-2 text-red-900">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, benefit }: { icon: React.ReactNode; title: string; description: string; benefit: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-3">{description}</p>
      <p className="text-blue-600 font-semibold text-sm">→ {benefit}</p>
    </div>
  );
}

function PricingCard({ name, price, features, cta, popular }: { name: string; price: string; features: string[]; cta: string; popular?: boolean }) {
  return (
    <div className={`p-6 rounded-lg border-2 ${popular ? 'border-blue-600 shadow-lg' : 'border-gray-200'} relative`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          MOST POPULAR
        </div>
      )}
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <div className="text-3xl font-bold mb-1">{price}</div>
        <div className="text-sm text-gray-600">/month</div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/sign-up">
        <button className={`w-full py-2 rounded-lg font-semibold ${popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-2 border-gray-300 hover:border-gray-400'}`}>
          {cta}
        </button>
      </Link>
    </div>
  );
}
