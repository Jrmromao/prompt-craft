'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Star, Clock, User, Plus, FileText, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TestPromptModal } from '@/components/TestPromptModal';
import { VersionPlayground } from '@/components/VersionPlayground';
import ReactMarkdown from 'react-markdown';
import { TestHistory } from '@/components/TestHistory';
import { Version } from '@/types/version';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface TestResult {
  id: string;
  createdAt: Date;
  rating: {
    clarity: number;
    specificity: number;
    context: number;
    overall: number;
    feedback?: string;
  };
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  currentVersionId: string;
}

// Dummy data for testing
const dummyTestHistory = [
  {
    id: 'dummy-1',
    createdAt: new Date().toISOString(),
    input: 'What is the capital of France?',
    output: 'The capital of France is Paris.',
    tokensUsed: 12,
    PromptVersion: {
      PromptTest: {
        PromptRating: {
          overall: 9,
          clarity: 9,
          specificity: 8,
          context: 9,
          feedback: 'Very clear and accurate.'
        }
      }
    }
  },
  {
    id: 'dummy-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    input: 'List 3 uses for a paperclip.',
    output: '1. Holding papers together. 2. Resetting devices. 3. Bookmark.',
    tokensUsed: 18,
    PromptVersion: {
      PromptTest: {
        PromptRating: {
          overall: 8,
          clarity: 8,
          specificity: 7,
          context: 8,
          feedback: 'Good, but could be more specific.'
        }
      }
    }
  },
  {
    id: 'dummy-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    input: 'Explain quantum computing in simple terms.',
    output: 'Quantum computing uses quantum bits to perform calculations much faster than traditional computers for certain problems.',
    tokensUsed: 25,
    PromptVersion: {
      PromptTest: {
        PromptRating: {
          overall: 7,
          clarity: 7,
          specificity: 6,
          context: 7,
          feedback: 'Simple explanation, but lacks detail.'
        }
      }
    }
  }
];

export default function VersionPage({ params, searchParams }: { params: { id: string }; searchParams: { versionId?: string } }) {
  const promptId = params.id;
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('FREE');

  useEffect(() => {
    async function fetchUserPlan() {
      try {
        const res = await fetch('/api/user/plan');
        const data = await res.json();
        setUserPlan(data.planType || 'FREE');
      } catch {
        setUserPlan('FREE');
      }
    }
    fetchUserPlan();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch prompt details
        const promptResponse = await fetch(`/api/prompts/${promptId}`);
        if (!promptResponse.ok) throw new Error('Failed to fetch prompt');
        const promptData = await promptResponse.json();
        setPrompt(promptData);

        // Fetch versions
        const versionsResponse = await fetch(`/api/prompts/${promptId}/versions`);
        if (!versionsResponse.ok) throw new Error('Failed to fetch versions');
        const versionsData = await versionsResponse.json();
        setVersions(versionsData);

        // Set initial selected version to the current version
        const currentVersion = versionsData.find((v: Version) => v.id === promptData.currentVersionId);
        setSelectedVersion(currentVersion || versionsData[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (promptId) fetchData();
  }, [promptId]);

  // Fetch test history when selectedVersion changes
  useEffect(() => {
    if (!selectedVersion) return;
    setIsLoadingHistory(true);
    fetch(`/api/prompts/${promptId}/test-history?promptVersionId=${selectedVersion.id}`)
      .then(res => res.json())
      .then(data => setTestHistory(data))
      .catch(() => setTestHistory([]))
      .finally(() => setIsLoadingHistory(false));
  }, [selectedVersion, promptId]);

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
        throw new Error('Failed to test prompt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing prompt:', error);
      throw error;
    }
  };

  // Map API data to TestHistoryItem format for TestHistory component
  let mappedTestHistory = testHistory.map((test) => ({
    id: test.id,
    createdAt: test.createdAt,
    testInput: test.input,
    testOutput: test.output,
    tokensUsed: test.tokensUsed,
    duration: test.duration,
    rating: test.PromptVersion?.PromptTest?.PromptRating
      ? {
          id: test.PromptVersion.PromptTest.PromptRating.id,
          clarity: test.PromptVersion.PromptTest.PromptRating.clarity,
          specificity: test.PromptVersion.PromptTest.PromptRating.specificity,
          context: test.PromptVersion.PromptTest.PromptRating.context,
          overall: test.PromptVersion.PromptTest.PromptRating.overall,
          feedback: test.PromptVersion.PromptTest.PromptRating.feedback,
        }
      : undefined,
  }));
  // Sort by best overall rating (descending), unrated last
  mappedTestHistory = mappedTestHistory.sort((a, b) => {
    const aRating = a.rating?.overall ?? -1;
    const bRating = b.rating?.overall ?? -1;
    return bRating - aRating;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Version Timeline Skeleton */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-36" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Content Skeleton */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!prompt || !selectedVersion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Prompt not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ArrowLeft className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </Button>
          <h1 className="mt-4 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {prompt.name}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {prompt.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Version Timeline */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Version History</h2>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    onClick={() => router.push(`/prompts/${promptId}/versioning`)}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Version
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-4">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                          selectedVersion.id === version.id
                            ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/30'
                            : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 dark:border-gray-800 dark:hover:border-purple-800 dark:hover:bg-purple-900/20'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Version {version.version}</span>
                            {selectedVersion.id === version.id && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(version.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Content and Testing */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="testing">Testing</TabsTrigger>
                    <TabsTrigger value="history">Test History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="mt-0">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{selectedVersion.content}</ReactMarkdown>
                    </div>
                  </TabsContent>

                  <TabsContent value="testing" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Test Prompt</h3>
                        <Button
                          onClick={() => setIsTestModalOpen(true)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                          disabled={isLoadingHistory}
                        >
                          {isLoadingHistory ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Run Test
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test this version of the prompt with different inputs to see how it performs.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Test History</h3>
                      {isLoadingHistory ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                              <Skeleton className="h-24 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <TestHistory
                          history={mappedTestHistory}
                          onSelectTest={() => {}}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <TestPromptModal
          userPlan={userPlan}
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          promptId={prompt.id}
          promptContent={selectedVersion.content}
          promptVersionId={selectedVersion.id}
          onTestPrompt={handleTestPrompt}
          onTestHistorySaved={() => {
            // Refetch test history after saving
            setIsLoadingHistory(true);
            fetch(`/api/prompts/${promptId}/test-history?promptVersionId=${selectedVersion.id}`)
              .then(res => res.json())
              .then(data => setTestHistory(data))
              .catch(() => setTestHistory([]))
              .finally(() => setIsLoadingHistory(false));
          }}
        />

        <VersionPlayground
          currentVersion={selectedVersion}
          onSaveVersion={async (data) => {
            try {
              const response = await fetch(`/api/prompts/${promptId}/versions`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Failed to create version');
              }

              const newVersion = await response.json();
              setVersions(prev => [...prev, newVersion]);
              setSelectedVersion(newVersion);
              setIsCreateVersionOpen(false);
            } catch (error) {
              console.error('Error creating version:', error);
            }
          }}
          onTestPrompt={handleTestPrompt}
        />
      </div>
    </div>
  );
} 