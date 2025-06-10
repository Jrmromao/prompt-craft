'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Star, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TestPromptModal } from '@/components/TestPromptModal';
import ReactMarkdown from 'react-markdown';

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

interface Version {
  id: string;
  version: number;
  content: string;
  createdAt: Date;
  user?: {
    name?: string;
    imageUrl?: string;
  };
  testResults?: TestResult[];
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  currentVersionId: string;
}

export default function VersionPage({ params }: { params: { id: string } }) {
  const promptId = params.id;
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

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
        throw new Error('Failed to test prompt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing prompt:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!prompt || !selectedVersion) {
    return <div>Prompt not found</div>;
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
                <h2 className="text-xl font-semibold mb-4">Version History</h2>
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
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Run Test
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
                      {selectedVersion.testResults?.length ? (
                        <div className="space-y-4">
                          {selectedVersion.testResults.map((result) => (
                            <Card key={result.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(result.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                          <span className="font-medium">{result.rating.overall}/10</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between gap-4">
                                            <span>Clarity:</span>
                                            <span>{result.rating.clarity}/10</span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4">
                                            <span>Specificity:</span>
                                            <span>{result.rating.specificity}/10</span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4">
                                            <span>Context:</span>
                                            <span>{result.rating.context}/10</span>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                {result.rating.feedback && (
                                  <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-900">
                                    <p className="text-muted-foreground">{result.rating.feedback}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No test results available for this version
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <TestPromptModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          promptContent={selectedVersion.content}
          promptVersionId={selectedVersion.id}
          onTestPrompt={handleTestPrompt}
        />
      </div>
    </div>
  );
} 