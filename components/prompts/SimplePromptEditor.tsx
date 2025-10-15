'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VersionControl } from './VersionControl';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Save, Wand2, Loader2, Sparkles, FileText, Settings, Eye, EyeOff, Copy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptData {
  name: string;
  content: string;
  description: string;
  isPublic: boolean;
}

interface AIRequest {
  userIdea: string;
  requirements: string;
  promptType: string;
  tone: string;
  model: string;
}

export function SimplePromptEditor() {
  const [prompt, setPrompt] = useState<PromptData>({
    name: '',
    content: '',
    description: '',
    isPublic: false
  });
  
  const [aiRequest, setAiRequest] = useState<AIRequest>({
    userIdea: '',
    requirements: '',
    promptType: 'conversational',
    tone: 'professional',
    model: 'deepseek'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [userLimits, setUserLimits] = useState({ versionsUsed: 0, maxVersionsPerPrompt: 3 });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const user = await response.json();
        const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';
        setUserPlan(isPro ? 'PRO' : 'FREE');
        setUserLimits({
          versionsUsed: user.versionsUsed || 0,
          maxVersionsPerPrompt: user.maxVersionsPerPrompt || 3
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!aiRequest.userIdea.trim()) {
      toast.error('Please describe what you want the prompt to do');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiRequest)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Extract the actual optimized prompt from the response
        let optimizedContent = result.optimizedPrompt;
        
        // If the content looks like JSON, try to parse it
        if (typeof optimizedContent === 'string' && optimizedContent.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(optimizedContent);
            optimizedContent = parsed.optimizedPrompt || optimizedContent;
          } catch {
            // If parsing fails, use as-is
          }
        }
        
        setPrompt(prev => ({
          ...prev,
          content: optimizedContent,
          name: aiRequest.userIdea.slice(0, 50) + (aiRequest.userIdea.length > 50 ? '...' : ''),
          description: `AI-generated prompt for: ${aiRequest.userIdea}`
        }));
        toast.success('✨ Prompt generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate prompt');
      }
    } catch (error) {
      toast.error('Error generating prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!prompt.name.trim() || !prompt.content.trim()) {
      toast.error('Name and content are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });

      
      if (response.ok) {
        const savedPrompt = await response.json();
        setSavedPromptId(savedPrompt.id);
        toast.success('🎉 Prompt saved successfully!');
        // Don't reset form to allow version control
      } else {
        const error = await response.json();
        console.error('Save error response:', error);
        if (error.code === 'LIMIT_REACHED') {
          toast.error('🚫 ' + error.error);
        } else {
          toast.error('Failed to save prompt: ' + (error.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Save catch error:', error);
      toast.error('Error saving prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Copied to clipboard!');
  };

  const handleExport = () => {
    // Export as markdown
    const markdownContent = `# ${prompt.name}

${prompt.description ? `## Description\n${prompt.description}\n\n` : ''}## Prompt Content

${prompt.content}

---
*Created: ${new Date().toLocaleDateString()}*`;
    
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'prompt'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getModelBadgeColor = (model: string) => {
    switch (model) {
      case 'deepseek': return 'bg-green-100 text-green-800 border-green-200';
      case 'gpt4': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'claude': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
          Create Your Perfect Prompt
        </h1>
        <p className="text-muted-foreground">
          Use AI to generate optimized prompts or craft your own from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Generation Section */}
          <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-xl">AI Prompt Generator</span>
                  <Badge className={cn("ml-2", getModelBadgeColor(aiRequest.model))}>
                    {aiRequest.model === 'deepseek' ? 'Free' : 'PRO'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="userIdea" className="text-base font-medium">
                  What do you want your prompt to do? *
                </Label>
                <Textarea
                  id="userIdea"
                  data-testid="user-idea-input"
                  placeholder="e.g., Write creative product descriptions for e-commerce that convert browsers into buyers..."
                  className="min-h-[100px] resize-none border-2 focus:border-blue-300 transition-colors"
                  value={aiRequest.userIdea}
                  onChange={(e) => setAiRequest(prev => ({ ...prev, userIdea: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="font-medium">Requirements</Label>
                  <Input
                    id="requirements"
                    placeholder="Specific needs..."
                    className="border-2 focus:border-blue-300 transition-colors"
                    value={aiRequest.requirements}
                    onChange={(e) => setAiRequest(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="promptType" className="font-medium">Type</Label>
                  <div suppressHydrationWarning>
                    <Select value={aiRequest.promptType} onValueChange={(value) => setAiRequest(prev => ({ ...prev, promptType: value }))}>
                      <SelectTrigger className="border-2 focus:border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creative">🎨 Creative</SelectItem>
                        <SelectItem value="analytical">📊 Analytical</SelectItem>
                        <SelectItem value="conversational">💬 Conversational</SelectItem>
                        <SelectItem value="technical">⚙️ Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="font-medium">Tone</Label>
                  <div suppressHydrationWarning>
                    <Select value={aiRequest.tone} onValueChange={(value) => setAiRequest(prev => ({ ...prev, tone: value }))}>
                      <SelectTrigger className="border-2 focus:border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">👔 Professional</SelectItem>
                        <SelectItem value="casual">😊 Casual</SelectItem>
                        <SelectItem value="friendly">🤝 Friendly</SelectItem>
                        <SelectItem value="authoritative">🎯 Authoritative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="font-medium">AI Model</Label>
                  <div suppressHydrationWarning>
                    <Select value={aiRequest.model} onValueChange={(value) => setAiRequest(prev => ({ ...prev, model: value }))}>
                      <SelectTrigger className="border-2 focus:border-blue-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deepseek">🆓 DeepSeek (Free)</SelectItem>
                        <SelectItem value="gpt4">⭐ GPT-4 (PRO)</SelectItem>
                        <SelectItem value="claude">🚀 Claude (PRO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGeneratePrompt} 
                disabled={isGenerating || !aiRequest.userIdea.trim()}
                data-testid="generate-prompt-button"
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating your perfect prompt...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Optimized Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Edit Section */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xl">Edit & Customize</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-medium">Prompt Name *</Label>
                  <Input
                    id="name"
                    data-testid="prompt-name-input"
                    placeholder="Give your prompt a memorable name..."
                    className="border-2 focus:border-blue-300 transition-colors"
                    value={prompt.name}
                    onChange={(e) => setPrompt(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Input
                    id="description"
                    data-testid="prompt-description-input"
                    placeholder="Brief description of what this prompt does..."
                    className="border-2 focus:border-blue-300 transition-colors"
                    value={prompt.description}
                    onChange={(e) => setPrompt(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-base font-medium">Prompt Content *</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="h-8"
                    >
                      {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                    {prompt.content && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyContent}
                          className="h-8"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExport}
                          className="h-8"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {showPreview ? (
                  <div className="min-h-[200px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 prose prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-medium mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-200 px-1 rounded text-sm" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto" {...props} />
                      }}
                    >
                      {prompt.content || '*Your prompt content will appear here...*'}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    id="content"
                    data-testid="prompt-content"
                    placeholder="Write your prompt here or generate one above..."
                    className="min-h-[200px] resize-none border-2 focus:border-blue-300 transition-colors"
                    value={prompt.content}
                    onChange={(e) => setPrompt(prev => ({ ...prev, content: e.target.value }))}
                  />
                )}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading || !prompt.name.trim() || !prompt.content.trim()} 
                  data-testid="save-prompt-button"
                  className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version Control Sidebar */}
        <div className="lg:col-span-1">
          {savedPromptId && (
            <VersionControl
              promptId={savedPromptId}
              currentContent={prompt.content}
              onVersionSelect={(content) => setPrompt(prev => ({ ...prev, content }))}
              userPlan={userPlan}
              versionsUsed={userLimits.versionsUsed}
              maxVersions={userLimits.maxVersionsPerPrompt}
            />
          )}
          {!savedPromptId && (
            <Card className="h-fit">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Save your prompt to enable version control</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
