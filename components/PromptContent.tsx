"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VoteButton } from '@/components/VoteButton';
// import { Comments } from '@/components/Comments';
import {CommentLite } from '@/components/CommentLite'
import { Analytics } from '@/components/Analytics';
import { VersionHistory } from '@/components/VersionHistory';
import { NavBar } from '@/components/layout/NavBar';
import { ArrowLeft, Share2, BookmarkPlus, Copy } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Comments } from './Comments';
import { useUser } from '@clerk/nextjs';

interface Tag {
  id: string;
  name: string;
}

interface Prompt {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  upvotes: number;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

interface PromptContentProps {
  prompt: Prompt;
}

export function PromptContent({ prompt }: PromptContentProps) {
  const { user } = useUser();
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar
        user={
          user
            ? {
                name: user.fullName || user.username || user.emailAddresses[0]?.emailAddress,
                email: user.emailAddresses[0]?.emailAddress,
                imageUrl: user.imageUrl,
              }
            : undefined
        }
      />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/community-prompts" 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Prompts
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{prompt.name}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="h-9 w-9"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <VoteButton id={prompt.id} initialUpvotes={prompt.upvotes} />
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
              ))}
            </div>
          </div>

          {prompt.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-6">{prompt.description}</p>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {prompt.content}
              </pre>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="comments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            <Card>
              <CardContent className="p-6">
                {/* <Comments id={prompt.id} /> */}
                <CommentLite id={prompt.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardContent className="p-6">
                <VersionHistory id={prompt.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="p-6">
                <Analytics promptId={prompt.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 