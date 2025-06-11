import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { PromptType } from '@/types/ai';

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  content: string;
  setContent: (content: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  promptType: PromptType;
  setPromptType: (type: PromptType) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  systemPrompt?: string;
  setSystemPrompt?: (prompt: string) => void;
  context?: string;
  setContext?: (context: string) => void;
  examples?: string[];
  setExamples?: (examples: string[]) => void;
  constraints?: string[];
  setConstraints?: (constraints: string[]) => void;
  outputFormat?: string;
  setOutputFormat?: (format: string) => void;
  temperature?: number;
  setTemperature?: (temp: number) => void;
  topP?: number;
  setTopP?: (value: number) => void;
  frequencyPenalty?: number;
  setFrequencyPenalty?: (value: number) => void;
  presencePenalty?: number;
  setPresencePenalty?: (value: number) => void;
  maxTokens?: number;
  setMaxTokens?: (value: number) => void;
  validationRules?: string[];
  setValidationRules?: (rules: string[]) => void;
  fallbackStrategy?: string;
  setFallbackStrategy?: (strategy: string) => void;
}

export function CreatePromptDialog({
  open,
  onOpenChange,
  onSubmit,
  name,
  setName,
  description,
  setDescription,
  content,
  setContent,
  isPublic,
  setIsPublic,
  promptType,
  setPromptType,
  tags,
  setTags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  systemPrompt,
  setSystemPrompt,
  context,
  setContext,
  examples,
  setExamples,
  constraints,
  setConstraints,
  outputFormat,
  setOutputFormat,
  temperature,
  setTemperature,
  topP,
  setTopP,
  frequencyPenalty,
  setFrequencyPenalty,
  presencePenalty,
  setPresencePenalty,
  maxTokens,
  setMaxTokens,
  validationRules,
  setValidationRules,
  fallbackStrategy,
  setFallbackStrategy,
}: CreatePromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            Create a new prompt that you can use for your AI interactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter prompt name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter prompt description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter prompt content"
                  required
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Purpose</Label>
                <select
                  id="type"
                  value={promptType}
                  onChange={e => setPromptType(e.target.value as PromptType)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="content-creation">Content Creation</option>
                  <option value="code-generation">Code Generation</option>
                  <option value="data-analysis">Data Analysis</option>
                  <option value="creative-writing">Creative Writing</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="technical">Technical</option>
                  <option value="research">Research</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Make Public</Label>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt?.(e.target.value)}
                  placeholder="Enter system-level instructions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context</Label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={e => setContext?.(e.target.value)}
                  placeholder="Enter additional context"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examples">Examples (one per line)</Label>
                <Textarea
                  id="examples"
                  value={examples?.join('\n')}
                  onChange={e => setExamples?.(e.target.value.split('\n'))}
                  placeholder="Enter examples"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints (one per line)</Label>
                <Textarea
                  id="constraints"
                  value={constraints?.join('\n')}
                  onChange={e => setConstraints?.(e.target.value.split('\n'))}
                  placeholder="Enter constraints"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Textarea
                  id="outputFormat"
                  value={outputFormat}
                  onChange={e => setOutputFormat?.(e.target.value)}
                  placeholder="Enter expected output format"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validationRules">Validation Rules (one per line)</Label>
                <Textarea
                  id="validationRules"
                  value={validationRules?.join('\n')}
                  onChange={e => setValidationRules?.(e.target.value.split('\n'))}
                  placeholder="Enter validation rules"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallbackStrategy">Fallback Strategy</Label>
                <Textarea
                  id="fallbackStrategy"
                  value={fallbackStrategy}
                  onChange={e => setFallbackStrategy?.(e.target.value)}
                  placeholder="Enter fallback strategy"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature: {temperature}</Label>
                <Slider
                  value={[temperature || 0.7]}
                  onValueChange={(values: number[]) => setTemperature?.(values[0])}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Top P: {topP}</Label>
                <Slider
                  value={[topP || 1]}
                  onValueChange={(values: number[]) => setTopP?.(values[0])}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency Penalty: {frequencyPenalty}</Label>
                <Slider
                  value={[frequencyPenalty || 0]}
                  onValueChange={(values: number[]) => setFrequencyPenalty?.(values[0])}
                  min={-2}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Presence Penalty: {presencePenalty}</Label>
                <Slider
                  value={[presencePenalty || 0]}
                  onValueChange={(values: number[]) => setPresencePenalty?.(values[0])}
                  min={-2}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={e => setMaxTokens?.(Number(e.target.value))}
                  placeholder="Enter max tokens"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Prompt</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
