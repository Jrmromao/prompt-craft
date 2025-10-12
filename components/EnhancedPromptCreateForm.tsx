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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  userIdea: z.string().min(10, 'Please provide more details about your idea'),
  requirements: z.string().optional(),
  targetAudience: z.string().optional(),
  promptType: z.enum(['creative', 'analytical', 'conversational', 'technical']).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
  tags: z.array(z.string()),
  isPublic: z.boolean()
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
      
      toast.success("Prompt Optimized!", {
        description: `Used ${result.data.creditsConsumed} credits`
      });
    } catch (error) {
      toast.error("Optimization Failed", {
        description: error instanceof Error ? error.message : 'Unknown error'
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
      toast.error("Failed to generate variations", {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const createPrompt = async () => {
    if (!selectedPrompt) {
      toast.error("No prompt selected", {
        description: "Please optimize your idea first"
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

      toast.success("Prompt Created!", {
        description: "Your optimized prompt has been saved"
      });

      // Reset form
      form.reset();
      setOptimizationResult(null);
      setVariations([]);
      setSelectedPrompt('');
      setActiveTab('idea');
    } catch (error) {
      toast.error("Creation Failed", {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI-Powered Prompt Creation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into optimized prompts with our intelligent AI assistant
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { key: 'idea', label: 'Your Idea', icon: Sparkles },
            { key: 'optimized', label: 'Optimized', icon: Wand2 },
            { key: 'variations', label: 'Variations', icon: RefreshCw },
            { key: 'finalize', label: 'Finalize', icon: Copy }
          ].map((step, index) => {
            const isActive = activeTab === step.key;
            const isCompleted = 
              (step.key === 'optimized' && optimizationResult) ||
              (step.key === 'variations' && variations.length > 0) ||
              (step.key === 'finalize' && selectedPrompt);
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <step.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="idea" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  Describe Your Prompt Idea
                </CardTitle>
                <p className="text-muted-foreground">
                  Tell us what you want your prompt to accomplish
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Prompt Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Blog Post Writer, Code Reviewer..."
                      className="h-12 border-2 focus:border-purple-500 transition-colors"
                      {...form.register('name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promptType" className="text-sm font-semibold">Prompt Type</Label>
                    <Select onValueChange={(value) => form.setValue('promptType', value as any)}>
                      <SelectTrigger className="h-12 border-2 focus:border-purple-500">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userIdea" className="text-sm font-semibold">Your Idea</Label>
                  <Textarea
                    id="userIdea"
                    placeholder="Describe what you want your prompt to do. Be as detailed as possible..."
                    className="min-h-[120px] border-2 focus:border-purple-500 transition-colors resize-none"
                    {...form.register('userIdea')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-sm font-semibold">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Developers, Marketers, Students..."
                      className="h-12 border-2 focus:border-purple-500 transition-colors"
                      {...form.register('targetAudience')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone" className="text-sm font-semibold">Tone</Label>
                    <Select onValueChange={(value) => form.setValue('tone', value as any)}>
                      <SelectTrigger className="h-12 border-2 focus:border-purple-500">
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

                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-sm font-semibold">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any specific requirements, constraints, or formatting needs..."
                    className="min-h-[80px] border-2 focus:border-purple-500 transition-colors resize-none"
                    {...form.register('requirements')}
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={form.handleSubmit(optimizePrompt)}
                    disabled={isOptimizing || !form.watch('userIdea') || form.watch('userIdea').length < 10}
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isOptimizing ? (
                      <LoadingSpinner text="Optimizing with AI..." />
                    ) : (
                      <>
                        <Wand2 className="mr-3 h-5 w-5" />
                        Optimize with AI (5 credits)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimized" className="space-y-6">
            {optimizationResult && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
                      <Wand2 className="h-6 w-6 text-green-600" />
                    </div>
                    AI-Optimized Prompt
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {optimizationResult.creditsConsumed} credits used
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                      {optimizationResult.optimizedPrompt}
                    </p>
                  </div>

                  {optimizationResult.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                        AI Suggestions
                      </h3>
                      <div className="grid gap-3">
                        {optimizationResult.suggestions.map((suggestion, index) => (
                          <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={() => setSelectedPrompt(optimizationResult.optimizedPrompt)}
                      className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Use This Prompt
                    </Button>
                    <Button
                      onClick={generateVariations}
                      variant="outline"
                      className="h-12 px-6 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 font-semibold rounded-xl transition-all duration-200"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Variations (2 credits each)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="variations" className="space-y-6">
            {variations.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900">
                      <RefreshCw className="h-6 w-6 text-orange-600" />
                    </div>
                    Prompt Variations
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Choose the variation that best fits your needs
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variations.map((variation, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedPrompt === variation
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPrompt(variation)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          Variation {index + 1}
                        </Badge>
                        {selectedPrompt === variation && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                        {variation}
                      </p>
                    </div>
                  ))}
                  
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setActiveTab('finalize')}
                      disabled={!selectedPrompt}
                      className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue to Finalize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finalize" className="space-y-6">
            {selectedPrompt && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                      <Copy className="h-6 w-6 text-emerald-600" />
                    </div>
                    Finalize Your Prompt
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Review and save your optimized prompt
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                    <h3 className="font-semibold mb-3 text-emerald-800 dark:text-emerald-200">Final Prompt:</h3>
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                      {selectedPrompt}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Visibility</Label>
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                        <input
                          type="checkbox"
                          id="isPublic"
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          {...form.register('isPublic')}
                        />
                        <Label htmlFor="isPublic" className="text-sm">
                          Make this prompt public for the community
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tags (Optional)</Label>
                      <Input
                        placeholder="e.g., writing, coding, marketing..."
                        className="h-12 border-2 focus:border-purple-500 transition-colors"
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                          form.setValue('tags', tags);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-6">
                    <Button
                      onClick={() => setActiveTab('variations')}
                      variant="outline"
                      className="h-12 px-6 border-2 border-gray-200 hover:border-gray-300 font-semibold rounded-xl transition-all duration-200"
                    >
                      Back to Variations
                    </Button>
                    <Button
                      onClick={createPrompt}
                      className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Save Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
