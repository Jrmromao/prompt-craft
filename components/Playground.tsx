'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy, Check, AlertCircle, Play, History, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CREDIT_COSTS, calculateCreditCost } from '@/app/constants/creditCosts';
import { PLAN_LIMITS } from '@/app/constants/planLimits';

interface PlaygroundProps {
  initialPrompt?: string;
  disabled?: boolean;
  onResult?: (result: string) => void;
  className?: string;
  showTitle?: boolean;
  promptId?: string;
}

interface Usage {
  planType: string;
  playgroundRunsThisMonth: number;
}

export default function Playground({
  initialPrompt = '',
  disabled = false,
  onResult,
  className = '',
  showTitle = true,
  promptId,
}: PlaygroundProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('prompt');
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [creditCost, setCreditCost] = useState(0);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/user/usage');
        if (!res.ok) throw new Error('Failed to fetch usage');
        const data = await res.json();
        setUsage(data);
        // Check if user is on a paid plan
        setIsPaidUser(data.planType !== 'FREE');
        
        // Calculate credit cost for playground run
        const cost = calculateCreditCost('PLAYGROUND_RUN', data.planType);
        setCreditCost(cost);
        
        // Check if user has exceeded their limit
        const limits = PLAN_LIMITS[data.planType as keyof typeof PLAN_LIMITS];
        const monthlyLimit = limits.playgroundRuns;
        setIsOverLimit(monthlyLimit !== -1 && data.playgroundRunsThisMonth >= monthlyLimit);
      } catch (e) {
        console.error('Error fetching usage:', e);
      }
    }
    fetchUsage();
  }, []);

  async function runPrompt() {
    if (!isPaidUser) {
      setShowUpgrade(true);
      return;
    }
    if (isOverLimit) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setOutput('');
    setError('');
    try {
      // First, check if we can run the prompt
      const checkRes = await fetch('/api/playground/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId }),
      });

      if (!checkRes.ok) {
        const checkData = await checkRes.json();
        if (
          checkData.error?.includes('Insufficient credits') ||
          checkData.error?.includes('upgrade')
        ) {
          setShowUpgrade(true);
          throw new Error(checkData.error);
        }
        throw new Error(checkData.error || 'Failed to check playground usage');
      }

      // If check passes, run the prompt
      const res = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          promptId: promptId,
          input: prompt,
          model: 'deepseek',
          temperature: 0.7
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('Insufficient credits') || data.error?.includes('upgrade')) {
          setShowUpgrade(true);
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Failed to run prompt');
      }

      setOutput(data.result || 'No output');
      if (onResult) onResult(data.result || 'No output');

      // Track the usage
      try {
        await fetch('/api/playground/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId }),
        });
      } catch (trackError) {
        console.error('Error tracking playground usage:', trackError);
      }

      // Refetch usage after a run
      if (usage) {
        setUsage((prevState: Usage | null) => {
          if (!prevState) return null;
          return { ...prevState, playgroundRunsThisMonth: prevState.playgroundRunsThisMonth + 1 };
        });
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className={cn('w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80', className)}>
      <CardHeader className={cn('pb-2', !showTitle && 'hidden')}>
        <div className="flex items-center justify-between gap-x-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
              <Play className="h-5 w-5 text-purple-600" />
            </div>
            Prompt Playground
          </CardTitle>
          {usage && (
            <Badge variant={usage.planType === 'PRO' ? 'default' : 'secondary'}>
              {usage.planType} Plan
              {usage.planType !== 'PRO' && (
                <span className="ml-2">
                  ({usage.playgroundRunsThisMonth}/{usage.planType === 'FREE' ? 20 : 300} runs)
                </span>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPaidUser ? (
          <div className="rounded-md border border-yellow-300 bg-yellow-100 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Upgrade Required
                </h4>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  The Playground is available exclusively for paid members. Upgrade your plan to access this feature.
                </p>
                <Button
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Pricing Plans
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Prompt
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-2" disabled={!output}>
                  <History className="h-4 w-4" />
                  Output
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="mt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="Type your prompt here..."
                      disabled={disabled || loading || isOverLimit}
                      className="min-h-[200px] font-mono text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => handleCopy(prompt)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={runPrompt}
                    disabled={loading || !prompt.trim() || disabled || isOverLimit}
                  >
                    {loading ? (
                      <LoadingSpinner text="Running..." />
                    ) : isOverLimit ? (
                      'Upgrade for more runs'
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Prompt ({creditCost} credits)
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output" className="mt-4">
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  {output ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">AI Output</h3>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(output)}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm">{output}</pre>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No output yet. Run a prompt to see results.
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {showUpgrade && (
              <div className="rounded-md border border-yellow-300 bg-yellow-100 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      You've run out of credits!
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {error?.includes('Insufficient credits')
                        ? 'You need more credits to continue using the Playground. Please purchase more credits to continue.'
                        : error?.includes('upgrade')
                          ? 'This feature requires a Pro subscription. Please upgrade your plan to continue.'
                          : "You've reached your Playground run limit for this month. Upgrade your plan for more runs!"}
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      View Pricing Plans
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && !showUpgrade && (
              <div className="rounded-md border border-red-300 bg-red-100 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
