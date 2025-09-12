'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Zap,
  Brain,
  Target,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  input: string;
  output: string;
  model: string;
  tokens: number;
  cost: number;
  duration: number;
  quality: number;
  timestamp: Date;
}

interface TestingSuiteProps {
  prompt: string;
  onResults?: (results: TestResult[]) => void;
}

export function PromptTestingSuite({ prompt, onResults }: TestingSuiteProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testInputs, setTestInputs] = useState<string[]>(['']);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [batchSize, setBatchSize] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [averageQuality, setAverageQuality] = useState(0);

  const models = [
    { id: 'gpt-4', name: 'GPT-4', cost: 0.03, speed: 'slow' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: 0.002, speed: 'fast' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', cost: 0.015, speed: 'medium' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', cost: 0.001, speed: 'fast' }
  ];

  const runTest = async (input: string, model: string) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          input, 
          model,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      const result: TestResult = {
        id: Math.random().toString(36).substr(2, 9),
        input,
        output: data.output || 'No response',
        model,
        tokens: data.tokens || 0,
        cost: data.cost || 0,
        duration,
        quality: data.quality || 75,
        timestamp: new Date()
      };

      return result;
    } catch (error) {
      console.error('Test error:', error);
      return null;
    }
  };

  const runBatchTests = async () => {
    if (!prompt.trim() || testInputs.length === 0) return;

    setIsRunning(true);
    const newResults: TestResult[] = [];

    for (const input of testInputs) {
      if (!input.trim()) continue;
      
      const result = await runTest(input, selectedModel);
      if (result) {
        newResults.push(result);
        setResults(prev => [...prev, result]);
      }
    }

    setIsRunning(false);
    onResults?.(newResults);
  };

  const addTestInput = () => {
    setTestInputs(prev => [...prev, '']);
  };

  const updateTestInput = (index: number, value: string) => {
    setTestInputs(prev => prev.map((input, i) => i === index ? value : input));
  };

  const removeTestInput = (index: number) => {
    setTestInputs(prev => prev.filter((_, i) => i !== index));
  };

  const clearResults = () => {
    setResults([]);
    setTotalCost(0);
    setAverageQuality(0);
  };

  useEffect(() => {
    const cost = results.reduce((sum, result) => sum + result.cost, 0);
    const quality = results.length > 0 
      ? results.reduce((sum, result) => sum + result.quality, 0) / results.length 
      : 0;
    
    setTotalCost(cost);
    setAverageQuality(quality);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} (${model.cost}/1k tokens)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Batch Size</label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={runBatchTests}
                disabled={isRunning || testInputs.length === 0}
                className="w-full"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Inputs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-green-600" />
              Test Inputs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addTestInput}>
              Add Input
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testInputs.map((input, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => updateTestInput(index, e.target.value)}
                  placeholder={`Test input ${index + 1}...`}
                  className="flex-1"
                />
                {testInputs.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTestInput(index)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Test Results
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearResults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-muted-foreground">Tests Run</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageQuality.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">${totalCost.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length) : 0}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
            </div>

            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Individual Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="space-y-4">
                {results.map((result, index) => (
                  <Card key={result.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.model}</Badge>
                          <Badge variant={result.quality > 80 ? 'default' : result.quality > 60 ? 'secondary' : 'destructive'}>
                            Quality: {result.quality}%
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.duration}ms • ${result.cost.toFixed(4)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Input:</div>
                          <div className="p-2 bg-gray-50 rounded text-sm">{result.input}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Output:</div>
                          <div className="p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
                            {result.output}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Quality Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Excellent (80-100%)</span>
                          <span>{results.filter(r => r.quality >= 80).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Good (60-79%)</span>
                          <span>{results.filter(r => r.quality >= 60 && r.quality < 80).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Needs Improvement (&lt;60%)</span>
                          <span>{results.filter(r => r.quality < 60).length}</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fastest Response</span>
                          <span>{Math.min(...results.map(r => r.duration))}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Slowest Response</span>
                          <span>{Math.max(...results.map(r => r.duration))}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Tokens</span>
                          <span>{results.reduce((sum, r) => sum + r.tokens, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
