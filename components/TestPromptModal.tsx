'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

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
  promptContent: string;
  promptVersionId: string;
  onTestPrompt: (content: string, testInput: string, promptVersionId: string) => Promise<TestResult>;
}

export function TestPromptModal({ isOpen, onClose, promptContent, promptVersionId, onTestPrompt }: TestPromptModalProps) {
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
    } catch (error) {
      console.error('Error testing prompt:', error);
      toast.error('Failed to test prompt');
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

  return (
    <>
      {/* Test Input Modal */}
      <Dialog open={isOpen && !showResults} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Prompt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={() => setShowResults(false)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Test Output</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(testResult?.result || '');
                    toast.success('Output copied to clipboard!');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{testResult?.result || ''}</ReactMarkdown>
              </div>
            </div>

            {testResult?.rating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating Results</h3>
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
                <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                      <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Clarity</h4>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (testResult?.rating?.clarity || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                        {testResult?.rating?.clarity || 0}/10
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                      <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Specificity</h4>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (testResult?.rating?.specificity || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                        {testResult?.rating?.specificity || 0}/10
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                      <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Context</h4>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (testResult?.rating?.context || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                        {testResult?.rating?.context || 0}/10
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</h4>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (testResult?.rating?.overall || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                      {testResult?.rating?.overall || 0}/10
                    </p>
                  </div>
                  {testResult?.rating?.feedback && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                      <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{testResult.rating.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}