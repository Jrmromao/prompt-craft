'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { HelpCircle, Info, Sparkles, Tag, Lock, Globe, Plus, X, Check, Wand2, BookOpen, Image, Video, Music } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  name?: string;
  setName?: (name: string) => void;
  description?: string;
  setDescription?: (description: string) => void;
  content?: string;
  setContent?: (content: string) => void;
  isPublic?: boolean;
  setIsPublic?: (isPublic: boolean) => void;
  promptType?: 'text' | 'image' | 'video' | 'music';
  setPromptType?: (promptType: 'text' | 'image' | 'video' | 'music') => void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
  newTag?: string;
  setNewTag?: (tag: string) => void;
  addTag?: () => void;
  removeTag?: (tag: string) => void;
}

interface FormData {
  name: string;
  description: string;
  content: string;
  isPublic: boolean;
  tags: string;
  tone: string;
  format: string;
  wordCount: string;
  targetAudience: string;
  includeExamples: boolean;
  includeKeywords: boolean;
  includeStructure: boolean;
  style?: string;
  resolution?: string;
  palette?: string;
  duration?: string;
  genre?: string;
  mood?: string;
  length?: string;
  instruments?: string;
  promptType: 'text' | 'image' | 'video' | 'music';
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
  "creative", "business", "marketing", "social-media", "twitter/X", "instagram", "facebook",
  "writing", "technical", "educational", "entertainment", "news", "review",
  "tutorial", "guide", "story", "script", "email"
];

const EXAMPLE_PROMPTS = [
  // Text Prompts
  {
    name: "Creative Writing",
    description: "Generate creative story ideas",
    content: "Write a short story in the [genre] genre, set in [location], featuring a protagonist who [character trait]. The story should explore themes of [theme] and include [specific element].",
    tags: ["creative", "writing", "storytelling"],
    tone: "creative",
    format: "story",
    promptType: "text"
  },
  {
    name: "Business Analysis",
    description: "Analyze market trends",
    content: "Analyze the current market trends in [industry] focusing on [specific aspect]. Consider factors such as [factor1], [factor2], and [factor3]. Provide insights on [specific question].",
    tags: ["business", "analysis", "market-research"],
    tone: "professional",
    format: "article",
    promptType: "text"
  },
  {
    name: "Social Media Post",
    description: "Create engaging social media content",
    content: "Create a [platform] post about [topic] that includes:\n- A catchy hook\n- [number] key points\n- A call to action\n- Relevant hashtags\n\nTarget audience: [audience]\nTone: [tone]",
    tags: ["social-media", "marketing", "content"],
    tone: "casual",
    format: "social-media",
    promptType: "text"
  },
  // Image Prompts
  {
    name: "Product Photography",
    description: "Generate product image descriptions",
    content: "Create a professional product photo of [product] with the following specifications:\n- Style: [style]\n- Lighting: [lighting]\n- Background: [background]\n- Composition: [composition]\n- Additional elements: [elements]",
    tags: ["image", "product", "photography"],
    style: "photorealistic",
    resolution: "1024x1024",
    palette: "professional",
    promptType: "image"
  },
  {
    name: "Character Design",
    description: "Design unique characters",
    content: "Design a character with the following attributes:\n- Species: [species]\n- Personality: [personality]\n- Style: [style]\n- Key features: [features]\n- Color scheme: [colors]",
    tags: ["image", "character", "design"],
    style: "cartoon",
    resolution: "1024x1024",
    palette: "vibrant",
    promptType: "image"
  },
  {
    name: "Landscape Art",
    description: "Create stunning landscapes",
    content: "Generate a landscape image of [location] with the following elements:\n- Time of day: [time]\n- Weather: [weather]\n- Style: [style]\n- Mood: [mood]\n- Key features: [features]",
    tags: ["image", "landscape", "art"],
    style: "painterly",
    resolution: "1024x1024",
    palette: "natural",
    promptType: "image"
  },
  // Video Prompts
  {
    name: "Product Demo",
    description: "Create product demonstration videos",
    content: "Create a product demonstration video for [product] that includes:\n- Introduction: [intro]\n- Key features: [features]\n- Use cases: [use cases]\n- Call to action: [CTA]\n\nStyle: [style]\nDuration: [duration]",
    tags: ["video", "product", "marketing"],
    style: "professional",
    duration: "60s",
    resolution: "1920x1080",
    promptType: "video"
  },
  {
    name: "Tutorial Video",
    description: "Generate tutorial content",
    content: "Create a tutorial video about [topic] that includes:\n- Introduction\n- Step-by-step instructions\n- Tips and tricks\n- Common mistakes to avoid\n- Summary\n\nStyle: [style]\nDuration: [duration]",
    tags: ["video", "tutorial", "educational"],
    style: "educational",
    duration: "5min",
    resolution: "1920x1080",
    promptType: "video"
  },
  {
    name: "Social Media Reel",
    description: "Create engaging short-form content",
    content: "Create a social media reel about [topic] with:\n- Hook: [hook]\n- Main content: [content]\n- Transitions: [transitions]\n- Music: [music]\n- Call to action\n\nStyle: [style]\nDuration: [duration]",
    tags: ["video", "social-media", "content"],
    style: "trendy",
    duration: "30s",
    resolution: "1080x1920",
    promptType: "video"
  },
  // Music Prompts
  {
    name: "Background Music",
    description: "Generate ambient background music",
    content: "Create background music with the following specifications:\n- Genre: [genre]\n- Mood: [mood]\n- Instruments: [instruments]\n- Tempo: [tempo]\n- Duration: [duration]\n\nStyle: [style]",
    tags: ["music", "background", "ambient"],
    genre: "ambient",
    mood: "calm",
    length: "2min",
    instruments: "piano, strings, pads",
    promptType: "music"
  },
  {
    name: "Jingle Creation",
    description: "Create catchy brand jingles",
    content: "Create a brand jingle for [brand] with:\n- Style: [style]\n- Mood: [mood]\n- Key instruments: [instruments]\n- Duration: [duration]\n- Key message: [message]",
    tags: ["music", "jingle", "branding"],
    genre: "pop",
    mood: "upbeat",
    length: "30s",
    instruments: "synth, drums, bass",
    promptType: "music"
  },
  {
    name: "Soundtrack",
    description: "Generate emotional soundtracks",
    content: "Create a soundtrack piece that conveys [emotion] with:\n- Genre: [genre]\n- Mood: [mood]\n- Instruments: [instruments]\n- Structure: [structure]\n- Duration: [duration]",
    tags: ["music", "soundtrack", "emotional"],
    genre: "orchestral",
    mood: "dramatic",
    length: "3min",
    instruments: "orchestra, choir",
    promptType: "music"
  }
];

const PROMPT_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'music', label: 'Music' },
];

const checkSubscription = async () => {
  const res = await fetch('/api/subscription/check');
  return res.json();
};

export function CreatePromptDialog({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
  name: externalName,
  setName: externalSetName,
  description: externalDescription,
  setDescription: externalSetDescription,
  content: externalContent,
  setContent: externalSetContent,
  isPublic: externalIsPublic,
  setIsPublic: externalSetIsPublic,
  promptType: externalPromptType,
  setPromptType: externalSetPromptType,
  tags: externalTags,
  setTags: externalSetTags,
  newTag: externalNewTag,
  setNewTag: externalSetNewTag,
  addTag: externalAddTag,
  removeTag: externalRemoveTag,
}: CreatePromptDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [internalPromptType, setInternalPromptType] = useState<'text' | 'image' | 'video' | 'music'>('text');
  const [internalFormData, setInternalFormData] = useState<FormData>({
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
    includeStructure: false,
    promptType: 'text'
  });
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [internalNewTag, setInternalNewTag] = useState('');

  // Use external state if provided, otherwise use internal state
  const name = externalName ?? internalFormData.name;
  const setName = externalSetName ?? (value => setInternalFormData({ ...internalFormData, name: value }));
  const description = externalDescription ?? internalFormData.description;
  const setDescription = externalSetDescription ?? (value => setInternalFormData({ ...internalFormData, description: value }));
  const content = externalContent ?? internalFormData.content;
  const setContent = externalSetContent ?? (value => setInternalFormData({ ...internalFormData, content: value }));
  const isPublic = externalIsPublic ?? internalFormData.isPublic;
  const setIsPublic = externalSetIsPublic ?? (value => setInternalFormData({ ...internalFormData, isPublic: value }));
  const promptType = externalPromptType ?? internalPromptType;
  const setPromptType = externalSetPromptType ?? setInternalPromptType;
  const tags = externalTags ?? internalFormData.tags.split(',').map(tag => tag.trim());
  const setTags = externalSetTags ?? (value => setInternalFormData({ ...internalFormData, tags: value.join(',') }));
  const newTag = externalNewTag ?? internalNewTag;
  const setNewTag = externalSetNewTag ?? setInternalNewTag;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check subscription status
      const subscriptionStatus = await checkSubscription();
      
      if (!subscriptionStatus.canCreate) {
        toast({
          title: "Subscription Required",
          description: "Please subscribe to create more prompts.",
          variant: "destructive",
        });
        router.push(subscriptionStatus.redirectTo || '/pricing');
        return;
      }

      if (subscriptionStatus.isLastFree) {
        toast({
          title: "Last Free Prompt",
          description: "This is your last free prompt. Subscribe to continue creating prompts.",
          variant: "default",
        });
      }

      // Continue with prompt creation
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...internalFormData,
          tags: selectedTags,
          promptType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }

      // Send to LLM service
      const llmPayload: PromptPayload = {
        ...internalFormData,
        tags: selectedTags,
        promptType,
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

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
      setInternalFormData({
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
        includeStructure: false,
        promptType: 'text'
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
    setInternalFormData({
      ...internalFormData,
      name: example.name,
      description: example.description,
      content: example.content,
      tone: example.tone || '',
      format: example.format || '',
      style: example.style || '',
      resolution: example.resolution || '',
      palette: example.palette || '',
      duration: example.duration || '',
      genre: example.genre || '',
      mood: example.mood || '',
      length: example.length || '',
      instruments: example.instruments || '',
      isPublic: false
    });
    setSelectedTags(example.tags);
    setSelectedExample(index);
    setPromptType(example.promptType as 'text' | 'image' | 'video' | 'music');
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
      `Format: ${internalFormData.format || '[Format]'}`,
      `Tone: ${internalFormData.tone || '[Tone]'}`,
      `Target Audience: ${internalFormData.targetAudience || '[Audience]'}`,
      `Word Count: ${internalFormData.wordCount || '[Word Count]'}`,
      '',
      'Content Structure:',
      '1. [Introduction]',
      '2. [Main Points]',
      '3. [Supporting Details]',
      '4. [Conclusion]',
      '',
      'Additional Requirements:',
      internalFormData.includeExamples ? '- Include relevant examples\n' : '',
      internalFormData.includeKeywords ? '- Include SEO keywords\n' : '',
      internalFormData.includeStructure ? '- Provide detailed structure\n' : '',
    ].filter(Boolean).join('\n');

    setInternalFormData(prev => ({
      ...prev,
      content: structure
    }));
  };

  const addTag = () => {
    if (externalAddTag) {
      externalAddTag();
    } else if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (externalRemoveTag) {
      externalRemoveTag(tagToRemove);
    } else {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Create New AI Prompt
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Create a reusable prompt template that you can use for AI interactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6 h-[calc(90vh-180px)]">
          {/* Left Column - Form */}
          <div className="col-span-7 space-y-6 overflow-y-auto pr-4">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  Prompt Type
                </CardTitle>
                <CardDescription>Select the type of content you want to generate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <Button
                    variant={promptType === 'text' ? 'default' : 'outline'}
                    onClick={() => setPromptType('text')}
                    className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
                      promptType === 'text' 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>Text</span>
                  </Button>
                  <Button
                    variant={promptType === 'image' ? 'default' : 'outline'}
                    onClick={() => setPromptType('image')}
                    className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
                      promptType === 'image' 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <Image className="w-6 h-6" />
                    <span>Image</span>
                  </Button>
                  <Button
                    variant={promptType === 'video' ? 'default' : 'outline'}
                    onClick={() => setPromptType('video')}
                    className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
                      promptType === 'video' 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <Video className="w-6 h-6" />
                    <span>Video</span>
                  </Button>
                  <Button
                    variant={promptType === 'music' ? 'default' : 'outline'}
                    onClick={() => setPromptType('music')}
                    className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${
                      promptType === 'music' 
                        ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    <Music className="w-6 h-6" />
                    <span>Music</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Enter the basic details of your prompt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Generates creative story ideas with customizable parameters"
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Keep the existing prompt type specific forms but wrap them in Cards */}
              {promptType === 'text' && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Text Generation Settings
                    </CardTitle>
                    <CardDescription>Configure your text generation parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-700 dark:text-gray-200">Tone</Label>
                        <Select
                          value={internalFormData.tone}
                          onValueChange={(value) => setInternalFormData({ ...internalFormData, tone: value })}
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

                      <div className="flex items-center gap-2">
                        <Label className="text-gray-700 dark:text-gray-200">Format</Label>
                        <Select
                          value={internalFormData.format}
                          onValueChange={(value) => setInternalFormData({ ...internalFormData, format: value })}
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

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Word Count</Label>
                      <Input
                        type="text"
                        value={internalFormData.wordCount}
                        onChange={(e) => setInternalFormData({ ...internalFormData, wordCount: e.target.value })}
                        placeholder="e.g., 500-1000"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Target Audience</Label>
                      <Input
                        type="text"
                        value={internalFormData.targetAudience}
                        onChange={(e) => setInternalFormData({ ...internalFormData, targetAudience: e.target.value })}
                        placeholder="e.g., Young professionals"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-700 dark:text-gray-200">Quick Options</Label>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeExamples"
                            checked={internalFormData.includeExamples}
                            onCheckedChange={(checked) => 
                              setInternalFormData({ ...internalFormData, includeExamples: checked as boolean })
                            }
                            className="border-gray-300 dark:border-gray-600"
                          />
                          <Label htmlFor="includeExamples" className="text-gray-700 dark:text-gray-200">Include Examples</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeKeywords"
                            checked={internalFormData.includeKeywords}
                            onCheckedChange={(checked) => 
                              setInternalFormData({ ...internalFormData, includeKeywords: checked as boolean })
                            }
                            className="border-gray-300 dark:border-gray-600"
                          />
                          <Label htmlFor="includeKeywords" className="text-gray-700 dark:text-gray-200">Include Keywords</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="includeStructure"
                            checked={internalFormData.includeStructure}
                            onCheckedChange={(checked) => 
                              setInternalFormData({ ...internalFormData, includeStructure: checked as boolean })
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
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter your AI prompt template with [variables] in brackets"
                        className="min-h-[200px] font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {promptType === 'image' && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Image Generation Settings
                    </CardTitle>
                    <CardDescription>Configure your image generation parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Image Style</Label>
                      <Input
                        type="text"
                        value={internalFormData.style || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, style: e.target.value })}
                        placeholder="e.g., Photorealistic, Cartoon, Abstract"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Resolution</Label>
                      <Input
                        type="text"
                        value={internalFormData.resolution || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, resolution: e.target.value })}
                        placeholder="e.g., 1024x1024"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Color Palette</Label>
                      <Input
                        type="text"
                        value={internalFormData.palette || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, palette: e.target.value })}
                        placeholder="e.g., Vibrant, Pastel, Monochrome"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Prompt Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the image you want to generate, with [variables] in brackets"
                        className="min-h-[120px] font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {promptType === 'video' && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Video Generation Settings
                    </CardTitle>
                    <CardDescription>Configure your video generation parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Video Style</Label>
                      <Input
                        type="text"
                        value={internalFormData.style || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, style: e.target.value })}
                        placeholder="e.g., Animation, Cinematic, Documentary"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Duration</Label>
                      <Input
                        type="text"
                        value={internalFormData.duration || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, duration: e.target.value })}
                        placeholder="e.g., 30s, 2min"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Resolution</Label>
                      <Input
                        type="text"
                        value={internalFormData.resolution || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, resolution: e.target.value })}
                        placeholder="e.g., 1920x1080"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Prompt Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the video you want to generate, with [variables] in brackets"
                        className="min-h-[120px] font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {promptType === 'music' && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Music Generation Settings
                    </CardTitle>
                    <CardDescription>Configure your music generation parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Genre</Label>
                      <Input
                        type="text"
                        value={internalFormData.genre || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, genre: e.target.value })}
                        placeholder="e.g., Jazz, Pop, Classical"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Mood</Label>
                      <Input
                        type="text"
                        value={internalFormData.mood || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, mood: e.target.value })}
                        placeholder="e.g., Uplifting, Melancholic, Energetic"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Length</Label>
                      <Input
                        type="text"
                        value={internalFormData.length || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, length: e.target.value })}
                        placeholder="e.g., 2min, 30s"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Instruments</Label>
                      <Input
                        type="text"
                        value={internalFormData.instruments || ''}
                        onChange={(e) => setInternalFormData({ ...internalFormData, instruments: e.target.value })}
                        placeholder="e.g., Piano, Guitar, Drums"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-200">Prompt Content</Label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe the music you want to generate, with [variables] in brackets"
                        className="min-h-[120px] font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5 text-purple-500" />
                    Tags & Visibility
                  </CardTitle>
                  <CardDescription>Add tags and set visibility for your prompt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
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
                      checked={isPublic}
                      onCheckedChange={(checked) => setIsPublic(checked)}
                      className="data-[state=checked]:bg-purple-500"
                    />
                    <Label htmlFor="isPublic" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                      {isPublic ? (
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
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Right Column - Tips and Examples */}
          <div className="col-span-5 space-y-6 overflow-y-auto">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-purple-500" />
                  Tips for Creating Effective Prompts
                </CardTitle>
                <CardDescription>Best practices for creating high-quality prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {PROMPT_TIPS.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Example Prompts
                </CardTitle>
                <CardDescription>Browse through example prompts for inspiration</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {EXAMPLE_PROMPTS.filter(example => example.promptType === promptType).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => loadExample(EXAMPLE_PROMPTS.indexOf(example))}
                        className={`w-full p-4 text-left rounded-lg border transition-all ${
                          selectedExample === EXAMPLE_PROMPTS.indexOf(example)
                            ? 'border-purple-500 bg-purple-50 dark:bg-gray-800 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{example.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {example.description}
                        </div>
                        <div className="flex gap-2 mt-3">
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
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-800">
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
        </div>
      </DialogContent>
    </Dialog>
  );
} 