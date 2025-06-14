'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Copy, Star, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { InsufficientCreditsDialog } from '@/app/components/InsufficientCreditsDialog';

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
  promptVersionId?: string;
  onTestPrompt: (content: string, testInput: string, promptVersionId?: string) => Promise<any>;
  onTestHistorySaved?: () => void;
  userPlan: string;
}

export function TestPromptModal({
  isOpen,
  onClose,
  promptId,
  promptContent,
  promptVersionId,
  onTestPrompt,
  onTestHistorySaved,
  userPlan
}: TestPromptModalProps) {
  const [testInput, setTestInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const { balance, isLoading: isCreditLoading } = useCreditBalance();

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter some test input');
      return;
    }

    // Check if user has enough credits
    if (balance) {
      const totalCredits = balance.monthlyCredits + balance.purchasedCredits;
      const requiredCredits = 1; // Basic cost for testing a prompt

      if (totalCredits < requiredCredits) {
        setShowCreditsDialog(true);
        return;
      }
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await onTestPrompt(promptContent, testInput, promptVersionId);
      setTestResult(result.response);
      toast.success('Prompt tested successfully!');
      // Save test history after test run
      await fetch(`/api/prompts/${promptId}/test-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptVersionId,
          input: testInput,
          output: result.response,
          // Optionally add tokensUsed/duration if available in result
        }),
      });
      if (typeof onTestHistorySaved === 'function') {
        onTestHistorySaved();
      }
    } catch (error) {
      console.error('Error testing prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to test prompt');
    } finally {
      setIsTesting(false);
    }
  };

  const isFreeUser = userPlan === 'FREE';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Test Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testInput">Test Input</Label>
              <Textarea
                id="testInput"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter your test input here..."
                className="min-h-[100px]"
              />
            </div>
            {testResult && (
              <div className="space-y-2">
                <Label>Result</Label>
                <div className="rounded-lg border bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleTest}
              disabled={isTesting || isCreditLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
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
          </div>
        </DialogContent>
      </Dialog>

      <InsufficientCreditsDialog
        isOpen={showCreditsDialog}
        onClose={() => setShowCreditsDialog(false)}
        currentCredits={balance ? balance.monthlyCredits + balance.purchasedCredits : 0}
        requiredCredits={1}
      />
    </>
  );
}