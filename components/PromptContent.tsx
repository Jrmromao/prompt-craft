'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Eye,
  Clock,
  Tag,
  User,
  Play,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { VoteButton } from '@/components/VoteButton';
import { Analytics } from '@/components/Analytics';
import { VersionHistory } from '@/components/VersionHistory';
import { NavBarWrapper } from '@/components/layout/NavBarWrapper';
import Playground from '@/components/Playground';
import { PromptAnalyticsProvider, usePromptAnalytics } from '@/components/PromptAnalyticsContext';
import { BasicComments } from '@/components/BasicComments';

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
  copyCount?: number;
  viewCount?: number;
  usageCount?: number;
}

export interface PromptContentProps {
  user?: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  prompt: Prompt;
}

export function PromptContent({ user, prompt }: PromptContentProps) {
  const displayName = user?.name || 'Guest';
  const [commentCount, setCommentCount] = useState<number>(0);
  const [upvotes, setUpvotes] = useState<number>(prompt.upvotes);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      
      // Track copy event and update count
      const response = await fetch(`/api/prompts/${prompt.id}/copy`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to track copy');
      }
      
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  const sharePrompt = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <NavBarWrapper />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/community-prompts"
            className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community Prompts
          </Link>
        </div>
        <PromptAnalyticsProvider
          promptId={prompt.id}
          initialCopyCount={prompt.copyCount || 0}
          initialViewCount={prompt.viewCount || 0}
          initialUsageCount={prompt.usageCount || 0}
          initialCommentCount={commentCount}
        >
          {/* Wrap the content that needs analytics context */}
          <PromptContentWithAnalytics 
            prompt={prompt} 
            displayName={displayName}
            copied={copied}
            setCopied={setCopied}
            upvotes={upvotes}
            setUpvotes={setUpvotes}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
          />
        </PromptAnalyticsProvider>
      </main>
    </div>
  );
}

// Separate component that uses the analytics context
function PromptContentWithAnalytics({ 
  prompt, 
  displayName, 
  copied, 
  setCopied,
  upvotes,
  setUpvotes,
  commentCount,
  setCommentCount
}: { 
  prompt: Prompt; 
  displayName: string;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  upvotes: number;
  setUpvotes: (upvotes: number) => void;
  commentCount: number;
  setCommentCount: (count: number) => void;
}) {
  const { incrementCopyCount } = usePromptAnalytics();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      
      // Track copy event and update count
      await incrementCopyCount();
      
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast.error('Failed to copy prompt');
    }
  };

  const sharePrompt = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="grid gap-6">
      {/* Prompt Header Card */}
      <Card className="border-2 border-purple-100 dark:border-purple-900/30">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {prompt.name}
                </h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={sharePrompt}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share this prompt</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {prompt.description && (
                <p className="mb-4 text-gray-600 dark:text-gray-300">{prompt.description}</p>
              )}

              <div className="mb-4 flex flex-wrap gap-2">
                {prompt.tags.map(tag => (
                  <Badge
                    key={tag.id}
                    className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {displayName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {upvotes} upvotes
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <VoteButton id={prompt.id} initialUpvotes={upvotes} onVoteChange={setUpvotes} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                    <Play className="mr-2 h-4 w-4" />
                    Test in Playground
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Test this Prompt in Playground</DialogTitle>
                  </DialogHeader>
                  <Playground initialPrompt={prompt.content} showTitle={false} />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className={`flex items-center gap-2 border-gray-300 transition-all duration-200 dark:border-gray-700 ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}`}
                onClick={copyToClipboard}
                disabled={copied}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="comments">
                Comments{' '}
                {commentCount > 0 && (
                  <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {commentCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0">
              <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
                <div className="overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                  <ReactMarkdown>{prompt.content}</ReactMarkdown>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <BasicComments promptId={prompt.id} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Analytics promptId={prompt.id} upvotes={upvotes} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <VersionHistory id={prompt.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
