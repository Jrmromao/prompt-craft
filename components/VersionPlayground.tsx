'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Save, History, Settings, X, Tag, Star, StarHalf, Sparkles } from 'lucide-react';
import { Version } from '@/types/version';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { NewVersionModal } from '@/components/NewVersionModal';
import { VersionHistory } from '@/components/VersionHistory';
import ReactMarkdown from 'react-markdown';

interface PromptRating {
  clarity: number;
  specificity: number;
  context: number;
  overall: number;
  feedback: string;
}

interface VersionPlaygroundProps {
  currentVersion: Version;
  onSaveVersion: (data: {
    content: string;
    description: string;
    commitMessage: string;
    tags: string[];
    baseVersionId?: string;
    tests: Array<{ input: string; output: string; rating: PromptRating }>;
  }) => Promise<void>;
  onTestPrompt: (content: string, testInput: string, currentVersionId: string) => Promise<{
    result: string;
    rating: PromptRating;
  }>;
}

const LoadingDots = () => (
  <div className="flex items-center justify-center space-x-1 text-sm text-purple-600 dark:text-purple-400">
    <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"></div>
  </div>
);

const FunLoadingMessage = () => {
  const messages = [
    "Teaching AI to write better than Shakespeare...",
    "Brewing the perfect cup of digital coffee...",
    "Counting to infinity...",
    "Convincing the AI to be more creative...",
    "Untangling the neural networks...",
    "Feeding the hamsters powering our servers...",
    "Calculating the meaning of life, the universe, and everything...",
    "Downloading more RAM...",
    "Generating random excuses...",
    "Making the AI think it's human...",
  ];

  const [message] = useState(() => messages[Math.floor(Math.random() * messages.length)]);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedMessage(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Faster typing animation

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, message]);

  return (
    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center max-w-xs min-h-[1.5rem] hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">
      {displayedMessage}
      <span className="animate-pulse">|</span>
    </p>
  );
};

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-2">
      <FunLoadingMessage />
      <LoadingDots />
    </div>
  </div>
);

export function VersionPlayground({
  currentVersion,
  onSaveVersion,
  onTestPrompt,
}: VersionPlaygroundProps) {
  const params = useParams();
  const promptId = params?.id as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('playground');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [rating, setRating] = useState<PromptRating | null>(null);
  const [step, setStep] = useState<'input' | 'output'>('input');
  const [versions, setVersions] = useState<Version[]>([]);
  const [showIdenticalWarning, setShowIdenticalWarning] = useState(false);
  const [tests, setTests] = useState<Array<{ input: string; output: string; rating: PromptRating }>>([]);

  useEffect(() => {
    if (currentVersion) {
      setContent(currentVersion.content);
      setTags(currentVersion.tags || []);
      setCommitMessage(`Update from version ${currentVersion.version}`);
      setDescription(`New version based on version ${currentVersion.version}`);
    }
  }, [currentVersion]);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };

    if (promptId) {
      fetchVersions();
    }
  }, [promptId]);

  const handleTest = async () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter prompt content',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      const result = await onTestPrompt(content, testInput || content, currentVersion.id);
      setTestOutput(result.result);
      setRating(result.rating);
      // Save the test result
      setTests(prev => [...prev, { input: testInput || content, output: result.result, rating: result.rating }]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test prompt',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a commit message',
        variant: 'destructive',
      });
      return;
    }

    // Check if content is identical to current version
    const isIdentical = content === currentVersion.content && 
                       tags.join(',') === (currentVersion.tags || []).join(',') &&
                       !description.trim();

    if (isIdentical) {
      const confirmed = window.confirm(
        `This version is identical to version ${currentVersion.version}. Are you sure you want to create a new version?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    try {
      setIsLoading(true);
      await onSaveVersion({
        content,
        description: isIdentical ? `Identical to version ${currentVersion.version}` : description,
        commitMessage: isIdentical ? `Created identical version to ${currentVersion.version}` : commitMessage,
        tags,
        baseVersionId: currentVersion.id,
        tests, // Send the tests along with the version data
      });
      toast({
        title: 'Success',
        description: isIdentical 
          ? `New version created (identical to version ${currentVersion.version})`
          : 'New version created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new version',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (score: number) => {
    const stars = [];
    const maxStars = 10;
    const normalizedScore = Math.min(Math.max(score, 0), 10);
    const filledStars = Math.round(normalizedScore);
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${
            i <= filledStars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-muted-foreground ml-1">
          ({normalizedScore.toFixed(1)}/10)
        </span>
      </div>
    );
  };

  const GradientButton = ({ children, className = '', ...props }: any) => (
    <button
      className={`group relative transform overflow-hidden rounded-md bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-purple-700 hover:to-purple-800 hover:shadow-md active:scale-95 ${className}`}
      {...props}
    >
      <div className="relative flex items-center gap-2">
        {children}
      </div>
    </button>
  );

  return (
    <div className="space-y-6 h-full overflow-y-auto relative">
      {(isLoading || isTesting) && <LoadingOverlay />}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <TabsTrigger 
            value="playground"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Playground
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <History className="h-4 w-4 mr-2" />
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="mt-6">
          <div className="space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {content === currentVersion.content && 
             tags.join(',') === (currentVersion.tags || []).join(',') && 
             !description.trim() && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm font-medium">
                    This version is identical to version {currentVersion.version}. Please make changes before saving.
                  </p>
                </div>
              </div>
            )}
            <div className="group rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Prompt Content</h2>
              {isLoading && <LoadingDots />}
              <Label htmlFor="content" className="text-gray-700 dark:text-gray-200">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 min-h-[200px] font-mono text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Description</h2>
              {isLoading && <LoadingDots />}
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="mt-2 min-h-[100px] bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Commit Message</h2>
              {isLoading && <LoadingDots />}
              <Label htmlFor="commitMessage" className="text-gray-700 dark:text-gray-200">Commit Message</Label>
              <Input
                id="commitMessage"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Enter a commit message..."
                className="mt-2 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
                required
              />
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tags</h2>
              {isLoading && <LoadingDots />}
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-2 hover:text-white/80 focus:outline-none"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTag.trim() && !tags.includes(newTag.trim())) {
                        setTags([...tags, newTag.trim()]);
                        setNewTag('');
                      }
                    }
                  }}
                  className="bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
                />
                <GradientButton
                  type="button"
                  onClick={() => {
                    if (newTag.trim() && !tags.includes(newTag.trim())) {
                      setTags([...tags, newTag.trim()]);
                      setNewTag('');
                    }
                  }}
                >
                  Add
                </GradientButton>
              </div>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Test Prompt</h2>
              {isTesting && <LoadingDots />}
              <Label htmlFor="testInput" className="text-gray-700 dark:text-gray-200">Test Input</Label>
              <Textarea
                id="testInput"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test input (optional, defaults to prompt content)"
                className="mt-2 min-h-[100px] font-mono text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
              />
              <div className="flex justify-end">
                <GradientButton
                  onClick={handleTest}
                  disabled={isTesting}
                  className="mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isTesting ? (
                    <>
                      <span className="text-sm">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Run Test
                    </>
                  )}
                </GradientButton>
              </div>
              {testOutput && (
                <div className="mt-6 space-y-4">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Test Output</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="testOutput" className="text-sm font-medium">Raw Markdown</Label>
                      <Textarea
                        id="testOutput"
                        value={testOutput}
                        onChange={(e) => setTestOutput(e.target.value)}
                        className="min-h-[200px] font-mono text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preview</Label>
                      <div className="min-h-[200px] p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 prose dark:prose-invert max-w-none overflow-auto">
                        <ReactMarkdown>{testOutput}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {rating && (
                <div className="flex flex-col items-center w-full py-4">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Overall Rating</span>
                      {renderStars(rating?.overall || 0)}
                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-xl">
                      <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Clarity</span>
                          <div className="flex items-center gap-2">
                            {renderStars(rating?.clarity || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Specificity</span>
                          <div className="flex items-center gap-2">
                            {renderStars(rating?.specificity || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Context</span>
                          <div className="flex items-center gap-2">
                            {renderStars(rating?.context || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 mt-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {content.trim() ? (
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      content === currentVersion.content && 
                      tags.join(',') === (currentVersion.tags || []).join(',') && 
                      !description.trim() 
                        ? 'bg-yellow-500 animate-pulse' 
                        : 'bg-green-500'
                    }`}></span>
                    {content === currentVersion.content && 
                     tags.join(',') === (currentVersion.tags || []).join(',') && 
                     !description.trim() ? (
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        ⚠️ Identical to version {currentVersion.version}
                      </span>
                    ) : (
                      'Ready to save'
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Add content to save
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setContent('');
                    setDescription('');
                    setCommitMessage('');
                    setTags([]);
                    setShowIdenticalWarning(false);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Reset
                </button>
                <GradientButton
                  onClick={handleCreateVersion}
                  disabled={isLoading || !content.trim()}
                  className="text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      Save Version
                    </>
                  )}
                </GradientButton>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <VersionHistory id={promptId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 