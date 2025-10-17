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
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Developers tracking $50K+ in AI costs monthly
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              See Every Dollar<br />
              <span className="text-sky-600">Your AI Spends</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Track AI costs across OpenAI, Anthropic, and Claude. Real-time analytics, budget alerts, and smart routing to reduce costs by up to 60-80%.
            </p>
            <p className="text-xl font-semibold text-gray-900 mb-8 max-w-3xl mx-auto">
              Start free. Scale with confidence. Never overspend again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 flex items-center justify-center gap-2 text-lg"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="px-8 py-4 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Start 14-Day Free Trial →
                  </Link>
                  <Link
                    href="/docs"
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 text-lg"
                  >
                    View Documentation
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                No credit card
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Cancel anytime
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
              title="Bloated Prompts"
              description="Your prompts have 200 tokens when 50 would work. You're paying 4x more than you should."
            />
            <ProblemCard
              title="Wrong Models"
              description="Using GPT-4 for simple tasks that GPT-3.5 handles fine. Burning 20x more money."
            />
            <ProblemCard
              title="No Optimization"
              description="You know you're wasting money but have no time to manually optimize every prompt."
            />
          </div>
        </div>
      </div>

      {/* Solution Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI That Optimizes Your AI Costs</h2>
          <p className="text-xl text-gray-600">Automatic prompt optimization + smart routing = massive savings</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <StatCard number="50-80%" label="Token reduction" />
          <StatCard number="$234" label="Avg. monthly savings" />
          <StatCard number="2 min" label="Setup time" />
          <StatCard number="233%" label="ROI" />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">The Killer Feature: AI Optimization</h2>
          <p className="text-center text-gray-600 mb-12">Plus smart routing, tracking, and more</p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="AI Prompt Optimization"
              description="GPT-4 mini automatically rewrites your prompts to be 50-80% shorter while maintaining quality."
              benefit="$50/month value alone"
            />
            <FeatureCard
              icon={<TrendingDown className="w-8 h-8 text-blue-600" />}
              title="Smart Routing"
              description="Auto-route simple queries to GPT-3.5, complex ones to GPT-4. Save 20x on costs."
              benefit="Automatic, no code changes"
            />
            <FeatureCard
              icon={<DollarSign className="w-8 h-8 text-blue-600" />}
              title="Real Savings Tracking"
              description="See exactly how much you saved: 'Routed 68 prompts, saved $234 this month.'"
              benefit="Honest metrics, provable ROI"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Auto-Fallback"
              description="Rate limited? Automatically fallback to alternative models. Never fail again."
              benefit="99.9% uptime guaranteed"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Cost Limits"
              description="Set max spend per request. Prevent runaway costs from bad prompts."
              benefit="Budget protection built-in"
            />
            <FeatureCard
              icon={<AlertCircle className="w-8 h-8 text-blue-600" />}
              title="Email Alerts"
              description="Get notified when costs spike, error rates increase, or you hit budget limits."
              benefit="Never get surprised"
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
              title="Advanced Analytics"
              description="Cost/performance/quality insights. Know which prompts are worth optimizing."
              benefit="Data-driven decisions"
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-blue-600" />}
              title="Smart Caching"
              description="Cache identical requests. Reduce API costs by up to 80% for repeated queries."
              benefit="Instant + free responses"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Team Analytics"
              description="See costs by developer, department, or project. Allocate budgets fairly."
              benefit="Full visibility"
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
          <h2 className="text-3xl font-bold text-center mb-4">Enable AI Optimization in 2 Minutes</h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            Wrap your client once. Save 50-80% automatically.
          </p>
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-sm ml-2">your-app.ts</span>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code className="text-green-400">{`import OptiRelay from 'optirelay-sdk';
import OpenAI from 'openai';

const openai = new OpenAI();
const optirelay = new OptiRelay({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY,
  autoOptimize: true,  // 50-80% token reduction
  smartRouting: true,  // Auto-route to cheapest model
  costLimit: 0.10      // Max $0.10 per request
});

`}</code>
              <code className="text-yellow-400">{`// Wrap once
const tracked = optirelay.wrapOpenAI(openai);

`}</code>
              <code className="text-green-400">{`// Use normally - optimization happens automatically!
const result = await tracked.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Write a professional email...' }]
});

// ✅ Prompt optimized (62% shorter)
// ✅ Routed to GPT-3.5 (20x cheaper)
// ✅ Saved $0.0234 on this request`}</code>
            </pre>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-gray-400 text-sm">Timing code</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">&lt;50ms</div>
              <div className="text-gray-400 text-sm">Overhead</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">4</div>
              <div className="text-gray-400 text-sm">Providers</div>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-6">
            OpenAI • Anthropic • Gemini • Grok • TypeScript • Zero config
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
            features={["Optimize $100/mo AI costs", "7 days retention", "Basic routing"]}
            cta="Start Free"
          />
          <PricingCard
            name="Starter"
            price="$19"
            features={["Optimize $500/mo AI costs", "30 days retention", "Redis caching", "Email alerts"]}
            cta="Start Free"
          />
          <PricingCard
            name="Pro"
            price="$49"
            features={["Optimize $2k/mo AI costs", "90 days retention", "Prompt optimization", "Quality monitoring"]}
            cta="Start Free"
            popular
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            features={["Unlimited optimization", "1 year retention", "SSO & SLA", "Dedicated support"]}
            cta="Contact Sales"
          />
        </div>
        <p className="text-center text-gray-600 mt-8">
          All plans include 14-day free trial • Cancel anytime • 30-day money-back guarantee
        </p>
      </div>

      {/* Blog Section */}
      <BlogSection />

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

// Blog Section Component
function BlogSection() {
  const posts = [
    {
      title: "How to Reduce OpenAI API Costs by 40%",
      description: "Learn proven strategies to cut your OpenAI and LLM costs while maintaining response quality.",
      slug: "reduce-openai-costs",
      date: "Jan 15, 2025"
    },
    {
      title: "OpenAI vs Anthropic Cost Comparison 2025",
      description: "Complete cost breakdown of GPT-4, GPT-3.5, Claude 3 Opus, Sonnet, and Haiku with real pricing data.",
      slug: "openai-vs-anthropic-cost-comparison",
      date: "Jan 16, 2025"
    },
    {
      title: "7 Cheaper Alternatives to GPT-4",
      description: "Discover cost-effective GPT-4 alternatives that save up to 90% on LLM costs without losing performance.",
      slug: "gpt-4-alternatives-cheaper",
      date: "Jan 18, 2025"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Learn How to Optimize LLM Costs</h2>
          <p className="text-xl text-gray-600">
            Practical guides and strategies from our team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="text-sm text-gray-500 mb-2">{post.date}</div>
                <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                <div className="text-blue-600 font-medium flex items-center gap-2">
                  Read more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/blog">
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              View All Articles
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
