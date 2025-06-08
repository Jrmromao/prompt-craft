import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function KnowledgeBasePage() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>How to Use PromptHive Effectively</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Learn the best practices for creating, sharing, and managing your AI prompts on
            PromptHive. This guide covers tips, tricks, and common pitfalls to avoid.
          </p>
          <a href="#" className="mt-2 inline-block font-medium text-primary hover:underline">
            Read More
          </a>
        </CardContent>
      </Card>
      {/* Add more sample articles here if needed */}
    </div>
  );
}
