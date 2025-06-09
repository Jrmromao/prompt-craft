'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Save, History, Settings, X, Tag, Star, StarHalf } from 'lucide-react';
import { Version } from '@/types/version';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { TestHistory } from '@/components/TestHistory';

interface PromptRating {
  clarity: number;
  specificity: number;
  context: number;
  overall: number;
  feedback: string;
}

interface TestHistoryItem {
  id: string;
  createdAt: string;
  testInput: string;
  testOutput: string;
  tokensUsed: number;
  duration: number;
  rating?: PromptRating;
}

interface VersionPlaygroundProps {
  currentVersion: Version;
  onSaveVersion: (data: {
    content: string;
    description: string;
    commitMessage: string;
    tags: string[];
  }) => Promise<void>;
  onTestPrompt: (content: string, testInput: string) => Promise<{
    result: string;
    rating: PromptRating;
  }>;
}

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
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Log currentVersion when it changes
  useEffect(() => {
    console.log('Current Version:', currentVersion);
  }, [currentVersion]);

  // Preload form with current version details
  useEffect(() => {
    console.log('Setting form values from currentVersion:', currentVersion);
    if (currentVersion) {
      console.log('Setting content to:', currentVersion.content);
      setContent(currentVersion.content);
      console.log('Setting tags to:', currentVersion.tags);
      setTags(currentVersion.tags || []);
      console.log('Setting commit message to:', `Update from version ${currentVersion.version}`);
      setCommitMessage(`Update from version ${currentVersion.version}`);
      console.log('Setting description to:', `New version based on version ${currentVersion.version}`);
      setDescription(`New version based on version ${currentVersion.version}`);
    }
  }, [currentVersion]);

  useEffect(() => {
    if (currentVersion) {
      fetchTestHistory();
    }
  }, [currentVersion]);

  const fetchTestHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/prompts/${promptId}/test-history?versionId=${currentVersion.id}`);
      if (!response.ok) throw new Error('Failed to fetch test history');
      const data = await response.json();
      setTestHistory(data);
    } catch (error) {
      console.error('Error fetching test history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load test history',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const saveRating = async (ratingData: PromptRating) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          versionId: currentVersion.id,
          ...ratingData,
        }),
      });

      if (!response.ok) throw new Error('Failed to save rating');
      const savedRating = await response.json();
      return savedRating;
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to save rating',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveTestHistory = async (ratingId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/test-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          versionId: currentVersion.id,
          ratingId,
          testInput,
          testOutput,
          tokensUsed: 0, // TODO: Get actual token count
          duration: 0, // TODO: Get actual duration
        }),
      });

      if (!response.ok) throw new Error('Failed to save test history');
      await fetchTestHistory(); // Refresh history
    } catch (error) {
      console.error('Error saving test history:', error);
      toast({
        title: 'Error',
        description: 'Failed to save test history',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test input',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      const data = await onTestPrompt(content, testInput);
      setTestOutput(data.result);
      setRating(data.rating);
      setStep('output');

      // Save the test history
      const savedRating = await saveRating(data.rating);
      if (savedRating) {
        await saveTestHistory(savedRating.id);
      }
    } catch (error) {
      console.error('Error testing prompt:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test prompt',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleNewTest = () => {
    setTestInput('');
    setTestOutput('');
    setRating(null);
    setStep('input');
  };

  const handleSave = async () => {
    if (step === 'input') {
      setStep('output');
      return;
    }

    try {
      setIsLoading(true);
      await onSaveVersion({
        content,
        description,
        commitMessage,
        tags,
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

  const renderRatingStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 >= 1;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Your Prompt</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTest}
                    disabled={isTesting || !content.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Test Prompt
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Version
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prompt Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Enter your prompt content..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Input (Optional)</Label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                    placeholder="Enter test input..."
                  />
                  <Label>Test Output</Label>
                  <div className="min-h-[100px] p-3 rounded-md border bg-muted font-mono text-sm whitespace-pre-wrap">
                    {testOutput || 'Test output will appear here...'}
                  </div>
                </div>
              </div>

              {rating && (
                <Card className="p-4 mt-4 border-purple-200 dark:border-purple-800">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      Prompt Rating
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Clarity</Label>
                          <div className="flex items-center gap-1">
                            {renderRatingStars(rating.clarity)}
                            <span className="text-sm font-medium ml-2">{rating.clarity}/10</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Specificity</Label>
                          <div className="flex items-center gap-1">
                            {renderRatingStars(rating.specificity)}
                            <span className="text-sm font-medium ml-2">{rating.specificity}/10</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Context</Label>
                          <div className="flex items-center gap-1">
                            {renderRatingStars(rating.context)}
                            <span className="text-sm font-medium ml-2">{rating.context}/10</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Overall Score</Label>
                          <div className="flex items-center gap-1">
                            {renderRatingStars(rating.overall)}
                            <span className="text-sm font-medium ml-2">{rating.overall}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Feedback</Label>
                        <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/20 text-sm">
                          {rating.feedback}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-4 mt-4">
                <h4 className="text-lg font-semibold">Version Details</h4>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What changed in this version?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commitMessage">Commit Message</Label>
                  <Textarea
                    id="commitMessage"
                    placeholder="Describe the changes in detail"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <TestHistory
              history={testHistory}
              onSelectTest={(test) => {
                setTestInput(test.testInput || '');
                setTestOutput(test.testOutput || '');
                setRating(test.rating || null);
                setStep('output');
                setActiveTab('playground');
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 