import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Save 30-60% on AI costs automatically
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-gray-600 text-sm">Forever free</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>✅ Smart routing (saves 30-60%)</Feature>
                <Feature>1,000 requests/month</Feature>
                <Feature>Basic tracking</Feature>
                <Feature>7 days data retention</Feature>
                <Feature>Community support</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" variant="outline">Get Started Free</Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Try it free, see the savings
              </p>
            </CardContent>
          </Card>

          {/* Pro - Most Popular */}
          <Card className="border-2 border-blue-600 relative shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <div className="text-4xl font-bold mb-2">$9</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>✅ Everything in Free</Feature>
                <Feature>✅ Unlimited requests</Feature>
                <Feature>✅ Prompt optimization (50-80% savings)</Feature>
                <Feature>✅ Smart caching</Feature>
                <Feature>30 days data retention</Feature>
                <Feature>Advanced analytics</Feature>
                <Feature>Priority support</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" size="lg">Start Free Trial</Button>
              </Link>
              <p className="text-center text-sm text-green-600 font-medium mt-4">
                💰 Save $30+/month for $9
              </p>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
              <div className="text-4xl font-bold mb-2">$99</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>✅ Everything in Pro</Feature>
                <Feature>✅ Team collaboration</Feature>
                <Feature>✅ Custom limits</Feature>
                <Feature>90 days data retention</Feature>
                <Feature>Budget controls</Feature>
                <Feature>SSO & SAML</Feature>
                <Feature>Dedicated support</Feature>
                <Feature>SLA guarantee</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground mt-4">
                For teams and companies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-3xl mx-auto mt-16 p-8 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-bold text-center mb-6">💰 Your ROI</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-2">You Spend</p>
              <p className="text-3xl font-bold">$100/mo</p>
              <p className="text-sm text-gray-600">on OpenAI</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">We Save You</p>
              <p className="text-3xl font-bold text-green-600">$30/mo</p>
              <p className="text-sm text-gray-600">with smart routing</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">You Pay</p>
              <p className="text-3xl font-bold text-blue-600">$9/mo</p>
              <p className="text-sm text-gray-600">for Pro plan</p>
            </div>
          </div>
          <div className="text-center mt-6 p-4 bg-white rounded-lg">
            <p className="text-lg font-semibold">Net Savings: <span className="text-green-600">$21/month</span></p>
            <p className="text-sm text-gray-600">ROI: 233% ($30 saved for $9 paid)</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">How does smart routing save money?</h4>
              <p className="text-gray-600">
                We automatically route simple queries to cheaper models (GPT-3.5) while keeping complex queries on expensive models (GPT-4). This saves 30-60% without sacrificing quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I try Pro for free?</h4>
              <p className="text-gray-600">
                Yes! Start with the Free plan to see savings, then upgrade to Pro when you're ready for unlimited requests and prompt optimization.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What if I don't save money?</h4>
              <p className="text-gray-600">
                If you don't see at least $20/month in savings within 30 days, we'll refund your Pro subscription. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">
                Yes, cancel anytime. No long-term contracts. Your data is retained for 30 days after cancellation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
