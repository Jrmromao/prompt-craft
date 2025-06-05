import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, BookOpen, Headphones, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Support | PromptCraft",
  description: "Get help and support for your PromptCraft experience",
};

export default function SupportPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">How can we help you?</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're here to help you get the most out of PromptCraft. Choose the best way to get support below.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Support Tickets */}
          <Card className="flex flex-col items-center h-full min-h-[320px] p-6">
            <div className="flex flex-col items-center w-full flex-1">
              <div className="flex flex-col items-center">
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <h2 className="text-xl font-semibold text-center mb-2">Support Tickets</h2>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Create a new support ticket for personalized assistance with your specific issue.
                </p>
              </div>
              <div className="flex-grow" />
              <Link href="/support/new" className="w-full mt-4">
                <Button className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </Link>
            </div>
          </Card>

          {/* Knowledge Base */}
          <Card className="flex flex-col items-center h-full min-h-[320px] p-6">
            <div className="flex flex-col items-center w-full flex-1">
              <div className="flex flex-col items-center">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <h2 className="text-xl font-semibold text-center mb-2">Knowledge Base</h2>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Browse our comprehensive guides and documentation to find answers to common questions.
                </p>
              </div>
              <div className="flex-grow" />
              <Link href="/support/kb" className="w-full mt-4">
                <Button variant="outline" className="w-full" size="lg">
                  Browse Articles
                </Button>
              </Link>
            </div>
          </Card>

          {/* Live Chat */}
          <Card className="flex flex-col items-center h-full min-h-[320px] p-6">
            <div className="flex flex-col items-center w-full flex-1">
              <div className="flex flex-col items-center">
                <Headphones className="h-8 w-8 text-primary mb-2" />
                <h2 className="text-xl font-semibold text-center mb-2">Live Chat</h2>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Chat with our support team in real-time for immediate assistance.
                </p>
              </div>
              <div className="flex-grow" />
              <Link href="/support/chat" className="w-full mt-4">
                <Button variant="outline" className="w-full" size="lg">
                  Start Chat
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Support Tickets (Dummy Data) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Support Tickets (Demo)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Cannot access premium features</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-1">OPEN</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Category: Billing</div>
                <div className="text-sm text-muted-foreground">I upgraded to Pro but still see the free plan limitations.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Prompt export not working</span>
                  <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">RESOLVED</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Category: Technical Issue</div>
                <div className="text-sm text-muted-foreground">Exported file is empty when I try to download my prompts.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">How do I invite my team?</span>
                  <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1">IN PROGRESS</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Category: General Inquiry</div>
                <div className="text-sm text-muted-foreground">I want to add team members to my workspace. What are the steps?</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Feature request: Prompt templates</span>
                  <span className="text-xs bg-gray-100 text-gray-800 rounded px-2 py-1">CLOSED</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Category: Feature Request</div>
                <div className="text-sm text-muted-foreground">It would be great to have reusable prompt templates for common tasks.</div>
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
                <h3 className="font-semibold mb-2">How do I get started with PromptCraft?</h3>
                <p className="text-muted-foreground text-sm">
                  Learn the basics of creating and managing your AI prompts with our quick start guide.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What are the different subscription plans?</h3>
                <p className="text-muted-foreground text-sm">
                  Compare our free and premium plans to find the best fit for your needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How do I share prompts with my team?</h3>
                <p className="text-muted-foreground text-sm">
                  Discover how to collaborate and share prompts effectively with your team members.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Can I export my prompts?</h3>
                <p className="text-muted-foreground text-sm">
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
              <p className="text-muted-foreground text-sm">
                Create a support ticket or start a live chat with our team.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">2. Quick Response</div>
              <p className="text-muted-foreground text-sm">
                We'll respond to your request within 24 hours.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">3. Resolution</div>
              <p className="text-muted-foreground text-sm">
                We'll work with you until your issue is fully resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 