'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  GitBranch,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import remarkGfm from 'remark-gfm';

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
import { TestPromptModal } from './TestPromptModal';

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
  currentVersionId: string;
}

interface Version {
  id: string;
  version: number;
  content: string;
  createdAt: Date;
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
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${prompt.id}/versions`);
        if (response.ok) {
          const versions = await response.json();
          setVersions(versions);
          if (versions.length > 0) {
            setCurrentVersionId(versions[0].id);
            setSelectedVersion(versions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };

    fetchVersions();
  }, [prompt.id]);

  const copyToClipboard = async () => {
    try {
      const contentToCopy = selectedVersion?.content || prompt.content;
      await navigator.clipboard.writeText(contentToCopy);
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

  const handleTestPrompt = async (content: string, testInput: string, promptVersionId: string) => {
    try {
      const response = await fetch('/api/prompts/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, testInput, promptVersionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to test prompt');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing prompt:', error);
      toast.error('Failed to test prompt');
      throw error;
    }
  };

  // Copy code block handler for markdown
  function CodeBlock({ children, ...props }: any) {
    const codeRef = useRef<HTMLPreElement>(null);
    return (
      <div className="relative group">
        <pre ref={codeRef} {...props} className="rounded-lg bg-gray-900 text-white p-4 overflow-x-auto text-sm font-mono">
          {children}
        </pre>
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white px-2 py-1 rounded text-xs"
          onClick={() => {
            if (codeRef.current) {
              navigator.clipboard.writeText(codeRef.current.textContent || '');
              toast.success('Code copied!');
            }
          }}
          aria-label="Copy code"
        >
          <Copy className="h-4 w-4 inline" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <NavBarWrapper />
 
      <main ref={mainRef} className="mx-auto max-w-6xl px-4 py-10 space-y-10">
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
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {prompt.name}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Prompt ID: {prompt.id}</span>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {prompt.description}
                </p>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Prompt ID: {prompt.id}</span>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <VoteButton id={prompt.id} initialUpvotes={upvotes} onVoteChange={setUpvotes} />
                <Button
                  onClick={() => setIsTestModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Test Prompt
                </Button>
                <Button
                  variant="outline"
                  className="ml-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900"
                  onClick={() => router.push(`/prompts/${prompt.id}/versioning`)}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Manage Versions
                </Button>
              </div>
            </div>
            {/* Prompt Content Section */}
            <div className="group rounded-xl border border-gray-200 bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex flex-col gap-2">
                {/* Version Selector */}
                {versions.length > 0 && (
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Version History</span>
                    </div>
                    <Dialog open={isVersionSelectOpen} onOpenChange={setIsVersionSelectOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                        >
                          <span className="font-medium">Version {selectedVersion?.version || 'Latest'}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl">
                            <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Select Version
                          </DialogTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Choose a version to view or test
                          </p>
                        </DialogHeader>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                          {versions.map((version) => (
                            <div
                              key={version.id}
                              className={`rounded-lg border transition-all duration-200 ${
                                selectedVersion?.id === version.id
                                  ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/30'
                                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 dark:border-gray-800 dark:hover:border-purple-800 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              <Button
                                variant="ghost"
                                className={`w-full justify-start p-4 h-auto ${
                                  selectedVersion?.id === version.id
                                    ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/30'
                                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 dark:border-gray-800 dark:hover:border-purple-800 dark:hover:bg-purple-900/20'
                                }`}
                              >
                                <Button
                                  variant="ghost"
                                  className={`w-full justify-start p-4 h-auto ${
                                    selectedVersion?.id === version.id
                                      ? 'text-purple-700 dark:text-purple-300'
                                      : 'text-gray-700 dark:text-gray-300'
                                  }`}
                                  onClick={() => {
                                    setSelectedVersion(version);
                                    setIsVersionSelectOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">Version {version.version}</span>
                                      {selectedVersion?.id === version.id && (
                                        <Badge 
                                          variant="secondary" 
                                          className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                        >
                                          Current
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {new Date(version.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="mt-2 text-sm line-clamp-2 text-muted-foreground">
                                      {version.content.substring(0, 100)}...
                                    </div>
                                  </div>
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-end gap-2 border-t pt-4 dark:border-gray-800">
                            <Button
                              variant="outline"
                              onClick={() => setIsVersionSelectOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                              onClick={() => setIsVersionSelectOpen(false)}
                            >
                              Done
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
                {/* Content */}
                <div className="prose dark:prose-invert max-w-none p-0 overflow-x-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                    }}
                  >
                    {selectedVersion?.content || prompt.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            {/* Tabs Section */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Version History
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="relative">
                      Comments
                      {commentCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[11px] font-semibold text-white shadow-sm transition-transform hover:scale-110 dark:bg-purple-600">
                          {commentCount > 99 ? '99+' : commentCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="history" className="mt-0">
                    <VersionHistory id={prompt.id} />
                  </TabsContent>
                  <TabsContent value="comments" className="mt-0">
                    <BasicComments 
                      promptId={prompt.id} 
                      onCommentCountChange={setCommentCount}
                      initialComments={[]}
                    />
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-0">
                    <Analytics promptId={prompt.id} upvotes={upvotes} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </PromptAnalyticsProvider>
        <TestPromptModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          promptId={prompt.id}
          promptContent={selectedVersion?.content || prompt.content}
          promptVersionId={selectedVersion?.id || currentVersionId}
          onTestPrompt={handleTestPrompt}
        />
      </main>
    </div>
  );
}
