'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Loader2,
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

import { EnhancedVoting } from '@/components/collaboration/EnhancedVoting';
import { EnhancedComments } from '@/components/collaboration/EnhancedComments';
import { SmartRecommendations } from '@/components/ai/SmartRecommendations';
import { PromptAnalyticsDashboard } from '@/components/analytics/PromptAnalyticsDashboard';
import { Analytics } from '@/components/Analytics';
import { VersionHistory } from '@/components/VersionHistory';
import { NavBarWrapper } from '@/components/layout/NavBarWrapper';
import Playground from '@/components/Playground';
import { PromptAnalyticsProvider, usePromptAnalytics } from '@/components/PromptAnalyticsContext';
import { BasicComments } from '@/components/BasicComments';
import { TestPromptModal } from './TestPromptModal';
import { PlanType } from '@/utils/constants';

interface Tag {
  id: string;
  name: string;
}

interface PromptMetadata {
  copyCount?: number;
  viewCount?: number;
  usageCount?: number;
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
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    planType: PlanType;
  };
  prompt: {
    id: string;
    name: string;
    description: string | null;
    content: string;
    promptType: string;
    tags: Tag[];
    upvotes: number;
    metadata?: PromptMetadata;
    createdAt: Date;
    copyCount: number;
    viewCount: number;
    usageCount: number;
  };
  initialCommentCount?: number;
  initialVersionHistory?: any[];
  initialComments?: any[];
  initialAnalytics?: any;
}

function PromptContentInner({ user, prompt, initialCommentCount, initialVersionHistory, initialComments, initialAnalytics }: PromptContentProps) {
  const displayName = user?.username || 'Guest';


  const [upvotes, setUpvotes] = useState<number>(prompt.upvotes);
  const [copied, setCopied] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('history');
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const {
    copyCount,
    incrementCopyCount,
    commentCount,
    setCommentCount,
  } = usePromptAnalytics();
  const [isCommentCountLoading, setIsCommentCountLoading] = useState(false);

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
      await incrementCopyCount();
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying prompt:', error instanceof Error ? error.message : String(error));
      toast.error(error instanceof Error ? error.message : String(error));
      setCopied(false);
    }
  };

  const sharePrompt = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleTestPrompt = async (content: string, testInput: string, promptVersionId?: string) => {
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
      console.error('Error testing prompt:', error instanceof Error ? error.message : String(error));
      toast.error(error instanceof Error ? error.message : String(error));
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

  // Fetch latest comment count when Comments tab is activated
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // No fetch here! Only update count when a comment is added/deleted.
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <NavBarWrapper />
 
      <main ref={mainRef} className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/community-prompts"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community Prompts
          </Link>
        </div>
        <div className="space-y-10">
          {/* Header Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {prompt.name}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Prompt ID: {prompt.id}</span>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {prompt.description}
              </p>

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
              <EnhancedVoting
                promptId={prompt.id}
                initialStats={{
                  upvotes: upvotes,
                  downvotes: 0,
                  totalVotes: upvotes,
                  userVote: null,
                  recentVoters: [],
                  trending: false
                }}
                onStatsChange={(stats) => setUpvotes(stats.upvotes)}
                showAnalytics={true}
              />
              <Button
                onClick={() => setIsTestModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Test Prompt
              </Button>
              <Button
                variant="outline"
                className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                onClick={() => router.push(`/prompts/${prompt.id}/versioning`)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Manage Versions
              </Button>
            </div>
          </div>
          {/* Prompt Content Section */}
          <div className="group rounded-xl border border-gray-200 bg-white/50 p-2 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex flex-col gap-2">
              {/* Version Selector */}
              {versions.length > 0 && (
                <div className="flex items-center justify-between border-b border-gray-200 pb-1 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Version History</span>
                  </div>
                  <Dialog open={isVersionSelectOpen} onOpenChange={setIsVersionSelectOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <span className="font-medium">Version {selectedVersion?.version || 'Latest'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                          <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30'
                                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 dark:border-gray-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            <div
                              className={`w-full p-4 h-auto cursor-pointer ${
                                selectedVersion?.id === version.id
                                  ? 'text-blue-700 dark:text-blue-300'
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
                                      className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
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
                            </div>
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
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          onClick={() => setIsVersionSelectOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {/* Content */}
              <div className="prose dark:prose-invert max-w-none p-0 overflow-x-auto relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
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
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Version History
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="relative">
                    Comments
                    {isCommentCountLoading ? (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-300 text-white">
                        <Loader2 className="animate-spin h-4 w-4" />
                      </span>
                    ) : (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-semibold text-white shadow-sm transition-transform hover:scale-110 dark:bg-blue-600">
                        {commentCount > 99 ? '99+' : commentCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="mt-0">
                  <VersionHistory id={prompt.id} initialData={initialVersionHistory} />
                </TabsContent>
                <TabsContent value="comments" className="mt-0">
                  <BasicComments 
                    promptId={prompt.id} 
                    onCommentCountChange={setCommentCount}
                    initialComments={initialComments}
                    initialCommentCount={initialCommentCount}
                  />
                </TabsContent>
                <TabsContent value="analytics" className="mt-0">
                  <Analytics promptId={prompt.id} upvotes={upvotes} initialData={initialAnalytics} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <TestPromptModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          promptId={prompt.id}
          promptContent={selectedVersion?.content || prompt.content}
          promptVersionId={selectedVersion?.id || currentVersionId}
          onTestPrompt={handleTestPrompt}
          userPlan={user.planType}
        />
      </main>
    </div>
  );
}

export function PromptContent({ user, prompt, initialCommentCount, initialVersionHistory, initialComments, initialAnalytics }: PromptContentProps) {
  return (
    <PromptAnalyticsProvider
      promptId={prompt.id}
      initialCopyCount={prompt.copyCount || 0}
      initialViewCount={prompt.viewCount || 0}
      initialUsageCount={prompt.usageCount || 0}
      initialCommentCount={typeof initialCommentCount === 'number' ? initialCommentCount : 0}
    >
      <PromptContentInner
        user={user}
        prompt={prompt}
        initialCommentCount={initialCommentCount}
        initialVersionHistory={initialVersionHistory}
        initialComments={initialComments}
        initialAnalytics={initialAnalytics}
      />
    </PromptAnalyticsProvider>
  );
}
