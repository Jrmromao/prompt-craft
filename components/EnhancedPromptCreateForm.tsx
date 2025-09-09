'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  userIdea: z.string().min(10, 'Please provide more details about your idea'),
  requirements: z.string().optional(),
  targetAudience: z.string().optional(),
  promptType: z.enum(['creative', 'analytical', 'conversational', 'technical']).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false)
});

type FormData = z.infer<typeof formSchema>;

interface OptimizationResult {
  optimizedPrompt: string;
  suggestions: string[];
  improvements: string[];
  creditsConsumed: number;
}

export default function EnhancedPromptCreateForm() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState('idea');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      userIdea: '',
      requirements: '',
      targetAudience: '',
      tags: [],
      isPublic: false
    }
  });

  const optimizePrompt = async (data: FormData) => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdea: data.userIdea,
          requirements: data.requirements,
          targetAudience: data.targetAudience,
          promptType: data.promptType,
          tone: data.tone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Optimization failed');
      }

      const result = await response.json();
      setOptimizationResult(result.data);
      setSelectedPrompt(result.data.optimizedPrompt);
      setActiveTab('optimized');
      
      toast({
        title: "Prompt Optimized!",
        description: `Used ${result.data.creditsConsumed} credits`
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const generateVariations = async () => {
    if (!optimizationResult?.optimizedPrompt) return;
    
    try {
      const response = await fetch('/api/prompts/variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: optimizationResult.optimizedPrompt,
          count: 3
        })
      });

      if (!response.ok) throw new Error('Failed to generate variations');

      const result = await response.json();
      setVariations(result.data.variations);
      setActiveTab('variations');
    } catch (error) {
      toast({
        title: "Failed to generate variations",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const createPrompt = async () => {
    if (!selectedPrompt) {
      toast({
        title: "No prompt selected",
        description: "Please optimize your idea first",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = form.getValues();
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          content: selectedPrompt,
          description: formData.userIdea,
          tags: formData.tags,
          isPublic: formData.isPublic
        })
      });

      if (!response.ok) throw new Error('Failed to create prompt');

      toast({
        title: "Prompt Created!",
        description: "Your optimized prompt has been saved"
      });

      // Reset form
      form.reset();
      setOptimizationResult(null);
      setVariations([]);
      setSelectedPrompt('');
      setActiveTab('idea');
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Prompt Creation</h1>
        <p className="text-muted-foreground">Describe your idea and let AI optimize it into an effective prompt</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="idea">Your Idea</TabsTrigger>
          <TabsTrigger value="optimized" disabled={!optimizationResult}>Optimized</TabsTrigger>
          <TabsTrigger value="variations" disabled={variations.length === 0}>Variations</TabsTrigger>
          <TabsTrigger value="finalize" disabled={!selectedPrompt}>Finalize</TabsTrigger>
        </TabsList>

        <TabsContent value="idea" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Describe Your Prompt Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Prompt Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Blog Post Writer, Code Reviewer..."
                  {...form.register('name')}
                />
              </div>

              <div>
                <Label htmlFor="userIdea">Your Idea *</Label>
                <Textarea
                  id="userIdea"
                  placeholder="Describe what you want the prompt to do. Be as detailed as possible..."
                  rows={4}
                  {...form.register('userIdea')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promptType">Prompt Type</Label>
                  <Select onValueChange={(value) => form.setValue('promptType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Desired Tone</Label>
                  <Select onValueChange={(value) => form.setValue('tone', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Any specific requirements, constraints, or examples..."
                  rows={2}
                  {...form.register('requirements')}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., developers, marketers, students..."
                  {...form.register('targetAudience')}
                />
              </div>

              <Button 
                onClick={form.handleSubmit(optimizePrompt)}
                disabled={isOptimizing}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing... (5 credits)
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Optimize with AI (5 credits)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimized" className="space-y-4">
          {optimizationResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <pre className="whitespace-pre-wrap text-sm">{optimizationResult.optimizedPrompt}</pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(optimizationResult.optimizedPrompt)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateVariations}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Variations
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimizationResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="secondary" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Improvements Made</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {optimizationResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">
                            ✓
                          </Badge>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Variations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variations.map((variation, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">Variation {index + 1}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrompt(variation)}
                    >
                      Select This
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{variation}</pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finalize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{selectedPrompt}</pre>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...form.register('isPublic')}
                />
                <Label htmlFor="isPublic">Make this prompt public</Label>
              </div>

              <Button onClick={createPrompt} className="w-full">
                Create Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
