'use client';

import { ContextEngineeringService } from '@/lib/services/contextEngineering';

// Add these new props to the interface
interface CreatePromptDialogProps {
  // ... existing props
  contextDomain?: string;
  setContextDomain?: (domain: string) => void;
  contextExpertise?: string;
  setContextExpertise?: (expertise: string) => void;
  autoEnhance?: boolean;
  setAutoEnhance?: (enhance: boolean) => void;
}

// Add context engineering section in the dialog
const contextService = ContextEngineeringService.getInstance();

const handleContextEnhancement = async () => {
  if (!content.trim()) return;
  
  const enhanced = await contextService.enhancePrompt(content, {
    domain: contextDomain,
    promptType: promptType,
    userId: 'current-user' // Get from auth
  });
  
  setContent(enhanced);
  toast.success('Prompt enhanced with context!');
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { PREDEFINED_TAGS } from '@/lib/constants/tags';
import { Card } from '@/components/ui/card';
import { useState, FormEvent, Dispatch, SetStateAction } from 'react';

interface CreatePromptDialogProps {
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  onSubmit?: (e: FormEvent<Element>) => Promise<void>;
  name?: string;
  setName?: Dispatch<SetStateAction<string>>;
  description?: string;
  setDescription?: Dispatch<SetStateAction<string>>;
  content?: string;
  setContent?: Dispatch<SetStateAction<string>>;
  isPublic?: boolean;
  setIsPublic?: Dispatch<SetStateAction<boolean>>;
  promptType?: any;
  setPromptType?: (type: any) => void;
  tags?: string[];
  setTags?: Dispatch<SetStateAction<string[]>>;
  [key: string]: any; // Allow additional props
}

export function CreatePromptDialog(props: CreatePromptDialogProps = {}) {
  const [internalName, setInternalName] = React.useState('');
  const [internalDescription, setInternalDescription] = React.useState('');
  const [internalContent, setInternalContent] = React.useState('');
  const [internalIsPublic, setInternalIsPublic] = React.useState(true);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  
  // Use props if provided, otherwise use internal state
  const name = props.name ?? internalName;
  const setName = props.setName ?? setInternalName;
  const description = props.description ?? internalDescription;
  const setDescription = props.setDescription ?? setInternalDescription;
  const content = props.content ?? internalContent;
  const setContent = props.setContent ?? setInternalContent;
  const isPublic = props.isPublic ?? internalIsPublic;
  const setIsPublic = props.setIsPublic ?? setInternalIsPublic;
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxTokens, setMaxTokens] = React.useState(2048);
  const [step, setStep] = useState<'draft' | 'review'>('draft');
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: User submits draft, call AI to optimize
  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOptimizing(true);
    setError(null);
    try {
      const res = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.optimizedContent) {
        setError(data.error || 'Failed to optimize prompt');
        setIsOptimizing(false);
        return;
      }
      setAiContent(data.optimizedContent);
      setStep('review');
    } catch (err) {
      setError('Failed to optimize prompt');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Step 2: User reviews AI-enhanced prompt, can save or cancel
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          content: aiContent,
          isPublic,
          tags: selectedTags,
          temperature,
          maxTokens,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create prompt');
        setIsSaving(false);
        return;
      }
      alert('Prompt created successfully!');
      // Optionally, redirect or clear form
      setName('');
      setDescription('');
      setContent('');
      setIsPublic(true);
      setSelectedTags([]);
      setTemperature(0.7);
      setMaxTokens(2048);
      setAiContent(null);
      setStep('draft');
    } catch (err) {
      setError('Failed to create prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setStep('draft');
    setAiContent(null);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div>
      {step === 'draft' && (
        <form onSubmit={handleOptimize}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Give your prompt a descriptive name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what your prompt does and how to use it"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your prompt here..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make this prompt public</Label>
          </div>

          <div className="space-y-4">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(
                PREDEFINED_TAGS.reduce((acc, tag) => {
                  acc[tag.category] = acc[tag.category] || [];
                  acc[tag.category].push(tag);
                  return acc;
                }, {} as Record<string, typeof PREDEFINED_TAGS>)
              ).map(([category, tags]) => (
                <Card key={category} className="p-4">
                  <h3 className="font-semibold mb-2 capitalize">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature ({temperature})</Label>
                  <Slider
                    value={[temperature]}
                    onValueChange={([value]) => setTemperature(value)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens ({maxTokens})</Label>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([value]) => setMaxTokens(value)}
                    min={256}
                    max={4096}
                    step={256}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced">
              <div className="space-y-4">
                {/* Add advanced settings here */}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isOptimizing}>{isOptimizing ? 'Optimizing...' : 'Optimize with AI'}</Button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </form>
      )}
      {step === 'review' && aiContent && (
        <div>
          <h3>AI-Enhanced Prompt</h3>
          <Textarea value={aiContent} onChange={e => setAiContent(e.target.value)} />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Prompt'}</Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
}
