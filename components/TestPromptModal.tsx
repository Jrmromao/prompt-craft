'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play } from 'lucide-react';

interface PromptRating {
  clarity: number;
  specificity: number;
  context: number;
  overall: number;
  feedback: string;
}

interface TestPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptContent: string;
  onTestPrompt: (content: string, testInput: string) => Promise<{
    result: string;
    rating: PromptRating;
  }>;
}

export function TestPromptModal({ isOpen, onClose, promptContent, onTestPrompt }: TestPromptModalProps) {
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [rating, setRating] = useState<PromptRating | null>(null);

  const handleTest = async () => {
    if (!promptContent.trim()) {
      return;
    }

    setIsTesting(true);
    try {
      const result = await onTestPrompt(promptContent, testInput || promptContent);
      setTestOutput(result.result);
      setRating(result.rating);
    } catch (error) {
      console.error('Failed to test prompt:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const renderStars = (score: number) => {
    const stars = [];
    const maxStars = 5;
    const normalizedScore = Math.min(Math.max(score, 0), 5);
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
          ({normalizedScore.toFixed(1)}/5)
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Test Prompt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
            <Label htmlFor="testInput" className="text-gray-700 dark:text-gray-200">Test Input</Label>
            <Textarea
              id="testInput"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test input (optional, defaults to prompt content)"
              className="mt-2 min-h-[100px] font-mono text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:border-purple-500 dark:focus:border-purple-500"
            />
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="mt-4 w-full rounded-full bg-purple-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-purple-700 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 inline mr-2" />
                  Run Test
                </>
              )}
            </button>
          </div>

          {testOutput && (
            <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">Test Output</h2>
              <Textarea
                value={testOutput}
                readOnly
                className="min-h-[200px] font-mono text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
              />
            </div>
          )}

          {rating && (
            <div className="flex flex-col items-center w-full py-4">
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Overall Rating</span>
                  {renderStars(rating.overall)}
                </div>
                <div className="flex flex-col gap-4 w-full max-w-xl">
                  <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Clarity</span>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.clarity)}
                      </div>
                    </div>
                  </div>
                  <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Specificity</span>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.specificity)}
                      </div>
                    </div>
                  </div>
                  <div className="group rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Context</span>
                      <div className="flex items-center gap-2">
                        {renderStars(rating.context)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 