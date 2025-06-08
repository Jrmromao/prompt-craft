import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, BookOpen, Headphones, Plus, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support | PromptHive',
  description: 'Get help and support for your PromptHive experience',
};

export default function SupportPage() {
  return (
    <div className="container max-w-4xl py-12">
      {/* Logo Section */}

      <div className="space-y-12">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">How can we help you?</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            We're here to help you get the most out of PromptCraft. Choose the best way to get
            support below.
          </p>
        </div>

        {/* Main Cards Section */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Support Tickets */}
          <Card className="flex h-full min-h-[320px] flex-col items-center p-6">
            <div className="flex w-full flex-1 flex-col items-center">
              <div className="flex flex-col items-center">
                <MessageSquare className="mb-2 h-8 w-8 text-primary" />
                <h2 className="mb-2 text-center text-xl font-semibold">Support Tickets</h2>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Create a new support ticket for personalized assistance with your specific issue.
                </p>
              </div>
              <div className="flex-grow" />
              <Link href="/support/new" className="mt-4 w-full">
                <Button className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </Link>
            </div>
          </Card>

          {/* Knowledge Base */}
          <Card className="flex h-full min-h-[320px] flex-col items-center p-6">
            <div className="flex w-full flex-1 flex-col items-center">
              <div className="flex flex-col items-center">
                <BookOpen className="mb-2 h-8 w-8 text-primary" />
                <h2 className="mb-2 text-center text-xl font-semibold">Knowledge Base</h2>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Browse our comprehensive guides and documentation to find answers to common
                  questions.
                </p>
              </div>
              <div className="flex-grow" />
              <Link href="/support/kb" className="mt-4 w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Browse Articles
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Support Tickets Section */}
        <div className="space-y-4">
          <h2 className="mb-2 text-2xl font-semibold">Recent Support Tickets (Demo)</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Cannot access premium features</span>
                  <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    OPEN
                  </span>
                </div>
                <div className="mb-1 text-xs text-muted-foreground">Category: Billing</div>
                <div className="text-sm text-muted-foreground">
                  I upgraded to Pro but still see the free plan limitations.
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Prompt export not working</span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                    RESOLVED
                  </span>
                </div>
                <div className="mb-1 text-xs text-muted-foreground">Category: Technical Issue</div>
                <div className="text-sm text-muted-foreground">
                  Exported file is empty when I try to download my prompts.
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">How do I invite my team?</span>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    IN PROGRESS
                  </span>
                </div>
                <div className="mb-1 text-xs text-muted-foreground">Category: General Inquiry</div>
                <div className="text-sm text-muted-foreground">
                  I want to add team members to my workspace. What are the steps?
                </div>
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">Feature request: Prompt templates</span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                    CLOSED
                  </span>
                </div>
                <div className="mb-1 text-xs text-muted-foreground">Category: Feature Request</div>
                <div className="text-sm text-muted-foreground">
                  It would be great to have reusable prompt templates for common tasks.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Preview Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <Link href="/support/faq">
              <Button variant="link">View All FAQs</Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">How do I get started with PromptCraft?</h3>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of creating and managing your AI prompts with our quick start
                  guide.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">What are the different subscription plans?</h3>
                <p className="text-sm text-muted-foreground">
                  Compare our free and premium plans to find the best fit for your needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">How do I share prompts with my team?</h3>
                <p className="text-sm text-muted-foreground">
                  Discover how to collaborate and share prompts effectively with your team members.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">Can I export my prompts?</h3>
                <p className="text-sm text-muted-foreground">
                  Learn about our export options and how to backup your prompts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Process */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Support Process</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="font-semibold">1. Submit Your Request</div>
              <p className="text-sm text-muted-foreground">
                Create a support ticket or start a live chat with our team.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">2. Quick Response</div>
              <p className="text-sm text-muted-foreground">
                We'll respond to your request within 24 hours.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">3. Resolution</div>
              <p className="text-sm text-muted-foreground">
                We'll work with you until your issue is fully resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
