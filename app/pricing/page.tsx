import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { UpgradeButton } from '@/components/UpgradeButton';

export const metadata: Metadata = {
  title: 'Pricing - Start Free',
  description: 'Start free with 1,000 requests/month. Scale to Starter ($9/mo), Pro ($49/mo) or Enterprise (custom) as you grow. No credit card required.',
  openGraph: {
    title: 'CostLens Pricing - Start Free',
    description: 'Start free with 1,000 requests/month. Scale to Starter ($9/mo), Pro ($49/mo) or Enterprise (custom) as you grow.',
  },
  alternates: {
    canonical: 'https://optirelay.com/pricing',
  },
};

const Feature = ({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) => (
  <li className="flex items-start gap-2">
    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${highlight ? 'text-blue-600' : 'text-green-600'}`} />
    <span className={highlight ? 'font-semibold' : ''}>{children}</span>
  </li>
);

const MissingFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-gray-400">
    <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Save 30-60% on AI costs instantly
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Pay Only When You <span className="text-blue-600">Save Money</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you're saving hundreds per month. Cancel anytime.
          </p>
        </div>

        {/* Social Proof */}
        <div className="flex justify-center gap-8 mb-12 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Average 42% cost reduction</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>10x ROI guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span>Setup in 5 minutes</span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* Free */}
          <Card className="border-2 relative">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">Free</CardTitle>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-gray-600 text-sm">Forever free</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Optimize up to <strong>$100/month</strong> in AI costs
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <Feature>Basic analytics</Feature>
                <Feature>Smart routing</Feature>
                <Feature>7-day retention</Feature>
                <Feature>Community support</Feature>
                <MissingFeature>Caching</MissingFeature>
                <MissingFeature>Email alerts</MissingFeature>
                <MissingFeature>Priority support</MissingFeature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" variant="outline">Start Free</Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">
                Perfect for testing
              </p>
            </CardContent>
          </Card>

          {/* Starter */}
          <Card className="border-2 border-green-200 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Best Value
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">Starter</CardTitle>
              <div className="text-4xl font-bold mb-2">$9</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Optimize up to <strong>$500/month</strong> in AI costs
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <Feature>Everything in Free</Feature>
                <Feature highlight>Redis caching (40% savings)</Feature>
                <Feature>30-day retention</Feature>
                <Feature>Email support</Feature>
                <Feature>Savings reports</Feature>
                <Feature highlight>Email alerts</Feature>
                <MissingFeature>Team collaboration (Coming Soon)</MissingFeature>
              </ul>
              <UpgradeButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!}
                planName="Starter"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Upgrade Now
              </UpgradeButton>
              <p className="text-center text-xs text-green-600 font-semibold mt-3">
                💰 Save $50-150/month = 3-8x ROI
              </p>
            </CardContent>
          </Card>

          {/* Pro - Most Popular */}
          <Card className="border-2 border-blue-600 relative shadow-xl scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">Pro</CardTitle>
              <div className="text-4xl font-bold mb-2">$49</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Optimize up to <strong>$2,000/month</strong> in AI costs
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <Feature>Everything in Starter</Feature>
                <Feature highlight>AI prompt optimization</Feature>
                <Feature highlight>Quality monitoring</Feature>
                <Feature>90-day retention</Feature>
                <Feature>Priority support</Feature>
                <Feature>Team (5 users)</Feature>
                <Feature>Custom alerts</Feature>
              </ul>
              <UpgradeButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!}
                planName="Pro"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Upgrade Now
              </UpgradeButton>
              <p className="text-center text-xs text-blue-600 font-semibold mt-3">
                💰 Save $300-600/month = 9x ROI
              </p>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl mb-2">Enterprise</CardTitle>
              <div className="text-4xl font-bold mb-2">Custom</div>
              <p className="text-gray-600 text-sm">Contact us for pricing</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Unlimited</strong> AI cost optimization
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                <Feature>Everything in Pro</Feature>
                <Feature highlight>SSO (SAML)</Feature>
                <Feature>1-year retention</Feature>
                <Feature>Dedicated support</Feature>
                <Feature>Custom integrations</Feature>
                <Feature>Unlimited users</Feature>
                <Feature>SLA guarantee</Feature>
              </ul>
              <Link href="mailto:sales@optirelay.ai">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Contact Sales</Button>
              </Link>
              <p className="text-center text-xs text-purple-600 font-semibold mt-3">
                💰 Custom pricing for your needs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Triggers for Free Users */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-center">
                🚀 Free Users: Here's What You're Missing
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
                  <p className="text-sm text-gray-700">
                    Additional savings with <strong>Redis caching</strong> (Starter+)
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">25%</div>
                  <p className="text-sm text-gray-700">
                    More savings with <strong>prompt optimization</strong> (Pro+)
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">$401</div>
                  <p className="text-sm text-gray-700">
                    Average monthly net savings on <strong>Pro plan</strong>
                  </p>
                </div>
              </div>
              <div className="text-center mt-6">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade to Save More →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Calculate Your Savings</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4 text-center">Starter Customer</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>AI Spend:</span>
                  <span className="font-bold">$300/month</span>
                </div>
                <div className="flex justify-between">
                  <span>We Save:</span>
                  <span className="font-bold text-green-600">$90/month</span>
                </div>
                <div className="flex justify-between">
                  <span>You Pay:</span>
                  <span className="font-bold text-blue-600">$19/month</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Net Savings:</span>
                  <span className="font-bold text-green-600">$71/month</span>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">ROI: 3.7x</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-4 text-center font-semibold">Pro Customer</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>AI Spend:</span>
                  <span className="font-bold">$1,500/month</span>
                </div>
                <div className="flex justify-between">
                  <span>We Save:</span>
                  <span className="font-bold text-green-600">$450/month</span>
                </div>
                <div className="flex justify-between">
                  <span>You Pay:</span>
                  <span className="font-bold text-blue-600">$49/month</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Net Savings:</span>
                  <span className="font-bold text-green-600">$401/month</span>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">ROI: 9.2x 🎯</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4 text-center">Enterprise Customer</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>AI Spend:</span>
                  <span className="font-bold">$8,000/month</span>
                </div>
                <div className="flex justify-between">
                  <span>We Save:</span>
                  <span className="font-bold text-green-600">$2,400/month</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Net Savings:</span>
                  <span className="font-bold text-green-600">$2,400+/month</span>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">Contact us for custom pricing 📞</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-3xl mx-auto mb-16 p-8 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-bold text-center mb-4">💰 10x ROI Guarantee</h3>
          <p className="text-center text-gray-700 mb-4">
            If we don't save you at least 10x what you pay us, we'll refund your money. No questions asked.
          </p>
          <p className="text-center text-sm text-gray-600">
            We're confident because our average customer saves $400/month while paying $49/month.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">When should I upgrade from Free?</h4>
              <p className="text-gray-600">
                Upgrade when you're spending $100+/month on AI. At that point, even Starter ($19) will save you $30-50/month net.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What if I exceed my AI spend limit?</h4>
              <p className="text-gray-600">
                We'll notify you at 80% and suggest the right tier. Your app keeps working - we just pause tracking until you upgrade.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How do you calculate savings?</h4>
              <p className="text-gray-600">
                We track what you WOULD have paid (baseline cost) vs what you ACTUALLY paid (with our optimizations). The difference is your savings.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">
                Yes! Cancel anytime, no questions asked. Your data is retained for 30 days after cancellation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
