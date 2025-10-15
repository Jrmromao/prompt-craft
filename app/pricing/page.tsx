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
            Track your AI costs without breaking the bank
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-gray-600 text-sm">Forever free</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>1,000 tracked runs/month</Feature>
                <Feature>Track up to 5 prompts</Feature>
                <Feature>7 days data retention</Feature>
                <Feature>Basic analytics</Feature>
                <Feature>1 team member</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Starter */}
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Starter</CardTitle>
              <div className="text-4xl font-bold mb-2">$9</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>10,000 tracked runs/month</Feature>
                <Feature>Track up to 25 prompts</Feature>
                <Feature>30 days data retention</Feature>
                <Feature>Advanced analytics</Feature>
                <Feature>Cost optimization tips</Feature>
                <Feature>3 team members</Feature>
                <Feature>Email support</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-2 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <div className="text-4xl font-bold mb-2">$29</div>
              <p className="text-gray-600 text-sm">per month</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <Feature>100,000 tracked runs/month</Feature>
                <Feature>Unlimited prompts</Feature>
                <Feature>90 days data retention</Feature>
                <Feature>Advanced analytics</Feature>
                <Feature>Cost optimization tips</Feature>
                <Feature>A/B testing</Feature>
                <Feature>Custom alerts</Feature>
                <Feature>10 team members</Feature>
                <Feature>Priority support</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
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
                <Feature>Unlimited tracked runs</Feature>
                <Feature>Unlimited prompts</Feature>
                <Feature>1 year data retention</Feature>
                <Feature>Advanced analytics</Feature>
                <Feature>Cost optimization tips</Feature>
                <Feature>A/B testing</Feature>
                <Feature>Custom alerts</Feature>
                <Feature>Unlimited team members</Feature>
                <Feature>Dedicated support</Feature>
                <Feature>SSO</Feature>
                <Feature>Custom integrations</Feature>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQ
              question="What counts as a tracked run?"
              answer="Each API call to OpenAI or Anthropic that you track with our SDK counts as one run."
            />
            <FAQ
              question="Can I change plans anytime?"
              answer="Yes! Upgrade or downgrade anytime. Changes take effect immediately and we'll prorate the difference."
            />
            <FAQ
              question="What happens if I exceed my limit?"
              answer="We'll notify you when you're close to your limit. You can upgrade anytime or wait until next month."
            />
            <FAQ
              question="Do you offer refunds?"
              answer="Yes, we offer a 30-day money-back guarantee. No questions asked."
            />
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

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
