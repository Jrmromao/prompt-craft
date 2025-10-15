'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, DollarSign, Zap, Shield, Users, TrendingDown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export default function AnalyticsLanding({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Every Dollar You Spend on AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop guessing your OpenAI and Anthropic costs. Get real-time analytics, 
            cost optimization suggestions, and alerts before you overspend.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free tier includes 1,000 tracked runs/month • No credit card required
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">$0.001</div>
            <div className="text-gray-600">Cost per tracked run</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">&lt;50ms</div>
            <div className="text-gray-600">Tracking overhead</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">30%</div>
            <div className="text-gray-600">Average cost savings</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Control AI Costs</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
            title="Real-Time Analytics"
            description="Track every API call with detailed breakdowns by model, prompt, and user. See exactly where your money goes."
          />
          <FeatureCard
            icon={<DollarSign className="w-8 h-8 text-blue-600" />}
            title="Cost Optimization"
            description="Get AI-powered suggestions to reduce costs. Switch models, optimize prompts, and cut spending by 30%."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-blue-600" />}
            title="Performance Monitoring"
            description="Track latency, success rates, and token usage. Identify slow prompts and optimize performance."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-600" />}
            title="Budget Alerts"
            description="Set spending limits and get notified before you exceed them. Never get surprised by your bill again."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Team Collaboration"
            description="Share dashboards with your team. Track costs by department, project, or individual developer."
          />
          <FeatureCard
            icon={<TrendingDown className="w-8 h-8 text-blue-600" />}
            title="Cost Trends"
            description="Visualize spending over time. Forecast future costs and plan your budget with confidence."
          />
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Drop-In Integration</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
              <code>{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const openai = new OpenAI();
const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);

// That's it! All costs are now tracked.`}</code>
            </pre>
            <p className="text-center text-gray-600 mt-6">
              Works with OpenAI and Anthropic • Zero performance impact • 2 lines of code
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your AI Costs?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join developers who have saved thousands on their AI bills.
        </p>
        {!user && (
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
