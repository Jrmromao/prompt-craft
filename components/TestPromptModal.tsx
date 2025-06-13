'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Copy, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface TestResult {
  result: string;
  rating: {
    clarity: number;
    specificity: number;
    context: number;
    overall: number;
    feedback: string;
  };
}

interface TestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string;
  promptContent: string;
  promptVersionId: string;
  onTestPrompt: (content: string, testInput: string, promptVersionId: string) => Promise<TestResult>;
  onTestHistorySaved?: () => void;
  userPlan?: string;
}

export function TestPromptModal({ 
  isOpen, 
  onClose, 
  promptId, 
  promptContent, 
  promptVersionId, 
  onTestPrompt, 
  onTestHistorySaved,
  userPlan = 'FREE'
}: TestPromptModalProps) {
  const [testInput, setTestInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleTest = async () => {
    try {
      setIsTesting(true);
      const result = await onTestPrompt(promptContent, testInput, promptVersionId);
      setTestResult(result);
      setShowResults(true);
      // Save test history after test run
      await fetch(`/api/prompts/${promptId}/test-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptVersionId,
          input: testInput,
          output: result.result,
          // Optionally add tokensUsed/duration if available in result
        }),
      });
      if (typeof onTestHistorySaved === 'function') {
        onTestHistorySaved();
      }
    } catch (error) {
      console.error('Error testing prompt:', error);
      if (error instanceof Error && error.message.includes('not available in your current plan')) {
        toast.error('Please upgrade your plan to test prompts');
      } else {
        toast.error('Failed to test prompt');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTestInput('');
    setTestResult(null);
    setShowResults(false);
  };

  const isFreeUser = userPlan === 'FREE';

  return (
    <>
      {/* Test Input Modal */}
      <Dialog open={isOpen && !showResults} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Prompt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isFreeUser ? (
              <div className="text-center py-8 space-y-4">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Upgrade Required</h3>
                <p className="text-muted-foreground">
                  Prompt testing is available in our Pro plan and above. Upgrade to unlock this feature and more.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="testInput">Test Input</Label>
                  <Textarea
                    id="testInput"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test input (optional, defaults to prompt content)"
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={() => setShowResults(false)}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-2xl font-bold">Test Results</DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowResults(false)}
              className="ml-2"
              aria-label="Close"
            >
              ×
            </Button>
          </div>

          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto space-y-8 bg-gray-50 dark:bg-gray-900">
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Test Output</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(testResult?.result || '');
                    toast.success('Output copied to clipboard!');
                  }}
                  className="h-8 w-8 p-0"
                  aria-label="Copy output"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-base dark:prose-invert max-w-none whitespace-pre-line leading-relaxed text-[1.05rem]">
                <ReactMarkdown>{testResult?.result || ''}</ReactMarkdown>
              </div>
            </div>

            {testResult?.rating && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Rating Results</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowResults(false);
                        setTestResult(null);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/prompts/${promptVersionId}/test`;
                      }}
                    >
                      Edit & Test
                    </Button>
                  </div>
                </div>
                <div className="max-h-[220px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900 grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <h4 className="mb-2 text-base font-medium text-gray-600 dark:text-gray-300">Clarity</h4>
                    <div className="flex items-center justify-center mb-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < (testResult?.rating?.clarity || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {testResult?.rating?.clarity || 0}/10
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <h4 className="mb-2 text-base font-medium text-gray-600 dark:text-gray-300">Specificity</h4>
                    <div className="flex items-center justify-center mb-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < (testResult?.rating?.specificity || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {testResult?.rating?.specificity || 0}/10
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <h4 className="mb-2 text-base font-medium text-gray-600 dark:text-gray-300">Context</h4>
                    <div className="flex items-center justify-center mb-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < (testResult?.rating?.context || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {testResult?.rating?.context || 0}/10
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                  <h4 className="mb-2 text-base font-medium text-gray-600 dark:text-gray-300">Overall Rating</h4>
                  <div className="flex items-center justify-center mb-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < (testResult?.rating?.overall || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {testResult?.rating?.overall || 0}/10
                  </p>
                </div>
                {testResult?.rating?.feedback && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <h4 className="mb-2 text-base font-medium text-gray-600 dark:text-gray-300">Feedback</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{testResult.rating.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}