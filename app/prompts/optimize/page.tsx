'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, DollarSign, Zap } from 'lucide-react';

export default function PromptOptimizePage() {
  const [prompt, setPrompt] = useState('');
  const [targetModel, setTargetModel] = useState('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, targetModel }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Failed to optimize');
      }
    } catch (error) {
      alert('Failed to optimize prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold">AI Prompt Optimizer</h1>
          </div>
          <p className="text-muted-foreground">
            Reduce costs by 50-80% while maintaining quality. Powered by GPT-4.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Original Prompt</label>
              <Textarea
                placeholder="You are a helpful assistant. Please write a professional email about the quarterly report. Make sure it's polite and includes all the key points..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Model</label>
              <Select value={targetModel} onValueChange={setTargetModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleOptimize}
              disabled={!prompt || loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Optimizing...' : 'Optimize Prompt'}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{result.tokenReduction}%</p>
                  <p className="text-sm text-muted-foreground">Token Reduction</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">${result.estimatedSavings.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">Savings Per Call</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{result.qualityScore}%</p>
                  <p className="text-sm text-muted-foreground">Quality Maintained</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Original ({result.originalTokens} tokens)</label>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    {result.original}
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Optimized ({result.optimizedTokens} tokens)</label>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                    {result.optimized}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(result.optimized);
                    alert('Copied to clipboard!');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Optimized Prompt
                </Button>
                <Button
                  onClick={() => {
                    setPrompt('');
                    setResult(null);
                  }}
                  className="flex-1"
                >
                  Optimize Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>1. <strong>AI Analysis:</strong> GPT-4 analyzes your prompt for redundancy and inefficiency</p>
              <p>2. <strong>Optimization:</strong> Rewrites for clarity and brevity while maintaining intent</p>
              <p>3. <strong>Quality Check:</strong> Validates output quality matches original (90%+ maintained)</p>
              <p>4. <strong>Cost Savings:</strong> Shows exact savings per API call</p>
            </div>
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-sm font-medium">💡 Pro Tip: Optimize once, use forever. Save 50-80% on every call.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
