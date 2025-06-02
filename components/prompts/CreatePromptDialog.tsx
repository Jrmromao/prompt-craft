'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { HelpCircle, Info, Sparkles, Tag, Lock, Globe, Plus, X, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { sendPromptToLLM } from '@/services/aiService';
import type { PromptPayload } from '@/types/ai';

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PROMPT_TIPS = [
  "Be specific about your desired output format",
  "Include relevant context and constraints",
  "Specify the tone and style you want",
  "Mention any specific requirements or limitations",
  "Use clear and concise language"
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "witty", label: "Witty" },
  { value: "empowering", label: "Empowering" }
];

const FORMAT_OPTIONS = [
  { value: "blog-post", label: "Blog Post" },
  { value: "article", label: "Article" },
  { value: "social-media", label: "Social Media Post" },
  { value: "email", label: "Email" },
  { value: "story", label: "Story" },
  { value: "script", label: "Script" },
  { value: "tutorial", label: "Tutorial" }
];

const COMMON_TAGS = [
  "creative", "business", "marketing", "social-media", "writing",
  "technical", "educational", "entertainment", "news", "review",
  "tutorial", "guide", "story", "script", "email"
];

const EXAMPLE_PROMPTS = [
  {
    name: "Creative Writing",
    description: "Generate creative story ideas",
    content: "Write a short story in the [genre] genre, set in [location], featuring a protagonist who [character trait]. The story should explore themes of [theme] and include [specific element].",
    tags: ["creative", "writing", "storytelling"],
    tone: "creative",
    format: "story"
  },
  {
    name: "Business Analysis",
    description: "Analyze market trends",
    content: "Analyze the current market trends in [industry] focusing on [specific aspect]. Consider factors such as [factor1], [factor2], and [factor3]. Provide insights on [specific question].",
    tags: ["business", "analysis", "market-research"],
    tone: "professional",
    format: "article"
  },
  {
    name: "Social Media Post",
    description: "Create engaging social media content",
    content: "Create a [platform] post about [topic] that includes:\n- A catchy hook\n- [number] key points\n- A call to action\n- Relevant hashtags\n\nTarget audience: [audience]\nTone: [tone]",
    tags: ["social-media", "marketing", "content"],
    tone: "casual",
    format: "social-media"
  }
];

export function CreatePromptDialog({ open, onOpenChange, onSuccess }: CreatePromptDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    isPublic: false,
    tags: '',
    tone: '',
    format: '',
    wordCount: '',
    targetAudience: '',
    includeExamples: false,
    includeKeywords: false,
    includeStructure: false
  });
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }

      // Send to LLM service
      const llmPayload: PromptPayload = {
        ...formData,
        tags: selectedTags,
      };
      try {
        const llmResponse = await sendPromptToLLM(llmPayload);
        toast({
          title: 'LLM Response',
          description: typeof llmResponse === 'string' ? llmResponse : JSON.stringify(llmResponse),
        });
      } catch (llmError) {
        toast({
          title: 'LLM Error',
          description: llmError instanceof Error ? llmError.message : 'Failed to get LLM response',
          variant: 'destructive',
        });
      }

      toast({
        title: 'Success',
        description: 'Prompt created successfully',
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        content: '',
        isPublic: false,
        tags: '',
        tone: '',
        format: '',
        wordCount: '',
        targetAudience: '',
        includeExamples: false,
        includeKeywords: false,
        includeStructure: false
      });
      setSelectedTags([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prompt',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (index: number) => {
    const example = EXAMPLE_PROMPTS[index];
    setFormData({
      ...formData,
      name: example.name,
      description: example.description,
      content: example.content,
      tone: example.tone,
      format: example.format,
      isPublic: false
    });
    setSelectedTags(example.tags);
    setSelectedExample(index);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const generatePromptStructure = () => {
    const structure = [
      `Title: [Your Title]`,
      `Format: ${formData.format || '[Format]'}`,
      `Tone: ${formData.tone || '[Tone]'}`,
      `Target Audience: ${formData.targetAudience || '[Audience]'}`,
      `Word Count: ${formData.wordCount || '[Word Count]'}`,
      '',
      'Content Structure:',
      '1. [Introduction]',
      '2. [Main Points]',
      '3. [Supporting Details]',
      '4. [Conclusion]',
      '',
      'Additional Requirements:',
      formData.includeExamples ? '- Include relevant examples\n' : '',
      formData.includeKeywords ? '- Include SEO keywords\n' : '',
      formData.includeStructure ? '- Provide detailed structure\n' : '',
    ].filter(Boolean).join('\n');

    setFormData(prev => ({
      ...prev,
      content: structure
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Create New AI Prompt
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Create a reusable prompt template that you can use for AI interactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">Name</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-200">Give your prompt a clear, descriptive name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Creative Story Generator"
                  required
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-200">Description</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-200">Briefly explain what this prompt does</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Generates creative story ideas with customizable parameters"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-200">Tone</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData({ ...formData, tone: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem 
                          key={tone.value} 
                          value={tone.value}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-200">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {FORMAT_OPTIONS.map((format) => (
                        <SelectItem 
                          key={format.value} 
                          value={format.value}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-200">Word Count</Label>
                  <Input
                    type="text"
                    value={formData.wordCount}
                    onChange={(e) => setFormData({ ...formData, wordCount: e.target.value })}
                    placeholder="e.g., 500-1000"
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-200">Target Audience</Label>
                  <Input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., Young professionals"
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-700 dark:text-gray-200">Quick Options</Label>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeExamples"
                      checked={formData.includeExamples}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, includeExamples: checked as boolean })
                      }
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor="includeExamples" className="text-gray-700 dark:text-gray-200">Include Examples</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeKeywords"
                      checked={formData.includeKeywords}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, includeKeywords: checked as boolean })
                      }
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor="includeKeywords" className="text-gray-700 dark:text-gray-200">Include Keywords</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeStructure"
                      checked={formData.includeStructure}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, includeStructure: checked as boolean })
                      }
                      className="border-gray-300 dark:border-gray-600"
                    />
                    <Label htmlFor="includeStructure" className="text-gray-700 dark:text-gray-200">Include Structure</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-gray-700 dark:text-gray-200">Prompt Content</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-200">Use [brackets] for variables that can be customized</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePromptStructure}
                    className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Generate Structure
                  </Button>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your AI prompt template with [variables] in brackets"
                  className="min-h-[200px] font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-700 dark:text-gray-200">
                    <Tag className="w-4 h-4 mr-1" />
                    Tags
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {selectedTags.includes(tag) ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  className="data-[state=checked]:bg-purple-500"
                />
                <Label htmlFor="isPublic" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  {formData.isPublic ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Make prompt public
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Keep prompt private
                    </>
                  )}
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Prompt'}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="w-4 h-4 text-purple-500" />
                Tips for Creating Effective Prompts
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {PROMPT_TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Example Prompts</h3>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(index)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedExample === index
                        ? 'border-purple-500 bg-purple-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{example.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {example.description}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {example.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 