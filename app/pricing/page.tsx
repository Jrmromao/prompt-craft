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
            Start with 14-day free trial. Save 30-60% on AI costs automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Free Trial</CardTitle>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-gray-600 text-sm">14 days, no credit card</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>✅ All Pro features</Feature>
                <Feature>✅ Unlimited requests</Feature>
                <Feature>✅ Smart routing (saves 30-60%)</Feature>
                <Feature>✅ Prompt optimization</Feature>
                <Feature>✅ Smart caching</Feature>
                <Feature>✅ Priority support</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" size="lg">Start Free Trial</Button>
              </Link>
              <p className="text-center text-sm text-muted-foreground mt-4">
                No credit card required
              </p>
            </CardContent>
          </Card>

          {/* Pro - After Trial */}
          <Card className="border-2 border-blue-600 relative shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                After Trial
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <div className="text-4xl font-bold mb-2">$9</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>✅ Everything in trial</Feature>
                <Feature>✅ Unlimited requests forever</Feature>
                <Feature>✅ 30 days data retention</Feature>
                <Feature>✅ Advanced analytics</Feature>
                <Feature>✅ Priority support</Feature>
                <Feature>✅ Cancel anytime</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" size="lg">Start Free Trial</Button>
              </Link>
              <p className="text-center text-sm text-green-600 font-medium mt-4">
                💰 Save $30+/month for $9
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                  <p className="text-muted-foreground">
                    Team collaboration, custom limits, dedicated support, SLA
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-2">$99/mo</div>
                  <Link href="/sign-up">
                    <Button variant="outline">Contact Sales</Button>
                  </Link>
                </div>
              </div>
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
              <h4 className="font-semibold mb-2">How does the 14-day trial work?</h4>
              <p className="text-gray-600">
                Sign up and get full access to all Pro features for 14 days. No credit card required. After 14 days, you'll be prompted to upgrade to Pro ($9/month) to continue.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do I need a credit card for the trial?</h4>
              <p className="text-gray-600">
                No! Start your trial with just an email. Add payment details only when you're ready to continue after the trial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How does smart routing save money?</h4>
              <p className="text-gray-600">
                We automatically route simple queries to cheaper models (GPT-3.5) while keeping complex queries on expensive models (GPT-4). This saves 30-60% without sacrificing quality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What happens after the trial ends?</h4>
              <p className="text-gray-600">
                After 14 days, you'll be prompted to upgrade to Pro ($9/month). If you don't upgrade, your account will be paused but your data is retained for 30 days.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">
                Yes, cancel anytime. No long-term contracts. Your data is retained for 30 days after cancellation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What if I don't save money?</h4>
              <p className="text-gray-600">
                If you don't see at least $20/month in savings within 30 days of upgrading to Pro, we'll refund your subscription. No questions asked.
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
