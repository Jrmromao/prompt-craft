import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ | PromptCraft Support',
  description: 'Frequently asked questions about PromptCraft',
};

const faqCategories = [
  {
    title: 'Getting Started',
    questions: [
      {
        question: 'How do I get started with PromptCraft?',
        answer:
          "To get started with PromptCraft, simply sign up for an account and follow our quick start guide. You'll be able to create your first prompt in minutes.",
      },
      {
        question: 'What are the system requirements?',
        answer:
          'PromptCraft works on any modern web browser. We recommend using the latest version of Chrome, Firefox, Safari, or Edge for the best experience.',
      },
    ],
  },
  {
    title: 'Account & Subscription',
    questions: [
      {
        question: 'What are the different subscription plans?',
        answer:
          'We offer a free tier and several premium plans. The free tier includes basic features, while premium plans offer advanced features, priority support, and more.',
      },
      {
        question: 'How do I upgrade my subscription?',
        answer:
          'You can upgrade your subscription at any time from your account settings. We offer monthly and annual billing options with different features and limits.',
      },
    ],
  },
  {
    title: 'Features & Usage',
    questions: [
      {
        question: 'How do I share prompts with my team?',
        answer:
          'You can share prompts with your team by using our collaboration features. Simply create a team workspace and invite your team members to join.',
      },
      {
        question: 'Can I export my prompts?',
        answer:
          'Yes, you can export your prompts in various formats. Premium users can export in bulk and access advanced export options.',
      },
    ],
  },
  {
    title: 'Technical Support',
    questions: [
      {
        question: 'What should I do if I encounter an error?',
        answer:
          'If you encounter an error, please check our troubleshooting guide first. If the issue persists, create a support ticket and our team will help you resolve it.',
      },
      {
        question: 'How do I report a bug?',
        answer:
          'You can report bugs through our support ticket system. Please include as much detail as possible about the issue, including steps to reproduce it.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="mt-2 text-muted-foreground">
              Find answers to common questions about PromptCraft
            </p>
          </div>
          <Link href="/support">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Button>
          </Link>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map(category => (
            <div key={category.title} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category.title}</h2>
              <div className="grid gap-4">
                {category.questions.map(faq => (
                  <Card key={faq.question}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-semibold">Still have questions?</h3>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/support/new">
                  <Button>Create Support Ticket</Button>
                </Link>
                <Link href="/support/chat">
                  <Button variant="outline">Start Live Chat</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
