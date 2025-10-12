'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Wand2, Loader2 } from 'lucide-react';

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
        setPrompt(prev => ({
          ...prev,
          content: result.optimizedPrompt,
          name: aiRequest.userIdea.slice(0, 50) + (aiRequest.userIdea.length > 50 ? '...' : ''),
          description: `AI-generated prompt for: ${aiRequest.userIdea}`
        }));
        toast.success('Prompt generated successfully!');
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
        toast.success('Prompt saved successfully!');
        setPrompt({ name: '', content: '', description: '', isPublic: false });
        setAiRequest({ userIdea: '', requirements: '', promptType: 'conversational', tone: 'professional' });
      } else {
        toast.error('Failed to save prompt');
      }
    } catch (error) {
      toast.error('Error saving prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Prompt Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userIdea">What do you want your prompt to do?</Label>
            <Textarea
              id="userIdea"
              placeholder="e.g., Write creative product descriptions for e-commerce..."
              value={aiRequest.userIdea}
              onChange={(e) => setAiRequest(prev => ({ ...prev, userIdea: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (optional)</Label>
              <Input
                id="requirements"
                placeholder="Specific requirements..."
                value={aiRequest.requirements}
                onChange={(e) => setAiRequest(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptType">Prompt Type</Label>
              <div suppressHydrationWarning>
                <Select value={aiRequest.promptType} onValueChange={(value) => setAiRequest(prev => ({ ...prev, promptType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
              <Label htmlFor="tone">Tone</Label>
              <div suppressHydrationWarning>
                <Select value={aiRequest.tone} onValueChange={(value) => setAiRequest(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <div suppressHydrationWarning>
              <Select value={aiRequest.model} onValueChange={(value) => setAiRequest(prev => ({ ...prev, model: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek (Free)</SelectItem>
                  <SelectItem value="gpt4">GPT-4 (PRO)</SelectItem>
                  <SelectItem value="claude">Claude (PRO)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGeneratePrompt} 
            disabled={isGenerating || !aiRequest.userIdea.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Optimized Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Edit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Edit & Save Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Prompt Name</Label>
              <Input
                id="name"
                placeholder="Enter prompt name..."
                value={prompt.name}
                onChange={(e) => setPrompt(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description..."
                value={prompt.description}
                onChange={(e) => setPrompt(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              placeholder="Write your prompt here or generate one above..."
              className="min-h-[200px] resize-none"
              value={prompt.content}
              onChange={(e) => setPrompt(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={prompt.isPublic}
              onCheckedChange={(checked) => setPrompt(prev => ({ ...prev, isPublic: checked }))}
            />
            <Label htmlFor="public">Make this prompt public</Label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Prompt'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
