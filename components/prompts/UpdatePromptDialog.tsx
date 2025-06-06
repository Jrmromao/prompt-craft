'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  HelpCircle,
  Info,
  Sparkles,
  Tag,
  Lock,
  Globe,
  Plus,
  X,
  Check,
  Type,
  Image,
  Video,
  Music,
  Code,
  BookOpen,
  Stethoscope,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COMMON_TAGS = [
  'creative',
  'business',
  'marketing',
  'social-media',
  'twitter/X',
  'instagram',
  'facebook',
  'writing',
  'technical',
  'educational',
  'entertainment',
  'news',
  'review',
  'tutorial',
  'guide',
  'story',
  'script',
  'email',
  'medical',
  'seo',
] as const;

type PromptType = 'text' | 'image' | 'video' | 'music' | 'software' | 'medical';

interface UpdatePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  setContent: (content: string) => void;
  description: string;
  setDescription: (description: string) => void;
  promptId: string;
  currentPrompt: {
    id: string;
    name: string;
    description: string | null;
    content: string;
    promptType: string;
    tags: { id: string; name: string }[];
    metadata?: any;
  } | null;
  onSuccess?: () => void;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'witty', label: 'Witty' },
  { value: 'empowering', label: 'Empowering' },
];

const FORMAT_OPTIONS = [
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'social-media', label: 'Social Media Post' },
  { value: 'email', label: 'Email' },
  { value: 'story', label: 'Story' },
  { value: 'script', label: 'Script' },
  { value: 'tutorial', label: 'Tutorial' },
];

const SOFTWARE_TAGS = [
  'software',
  'debugging',
  'error',
  'troubleshooting',
  'optimization',
  'algorithm',
  'performance',
  'integration',
  'library',
  'API',
  'setup',
  'code review',
  'quality',
  'security',
  'testing',
  'language-specific',
  'framework',
  'dependency',
  'refactor',
  'bugfix',
  'documentation',
];

const TYPE_OPTIONS = [
  {
    value: 'text',
    label: 'Text',
    icon: BookOpen,
    description: 'Create text-based prompts for articles, stories, and general content',
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: 'image',
    label: 'Image',
    icon: Image,
    description: 'Generate prompts for image creation and visual content',
    color: 'from-purple-500 to-purple-600',
  },
  {
    value: 'video',
    label: 'Video',
    icon: Video,
    description: 'Create prompts for video content and motion graphics',
    color: 'from-pink-500 to-pink-600',
  },
  {
    value: 'music',
    label: 'Music',
    icon: Music,
    description: 'Generate prompts for music and audio content',
    color: 'from-green-500 to-green-600',
  },
  {
    value: 'software',
    label: 'Software',
    icon: Code,
    description: 'Create prompts for coding and software development',
    color: 'from-orange-500 to-orange-600',
  },
  {
    value: 'medical',
    label: 'Medical',
    icon: Stethoscope,
    description: 'Generate prompts for medical documentation and healthcare content',
    color: 'from-red-500 to-red-600',
  },
] as const;

const MedicalDisclaimer = () => (
  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
    <div className="flex items-start gap-2">
      <Info className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      <div className="space-y-2">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Important Notice</h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Medical prompts are provided for educational and reference purposes only. They should not
          be used as a substitute for professional medical advice, diagnosis, or treatment. Always
          consult with qualified healthcare professionals for medical decisions.
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
          <li>Verify all medical information with qualified professionals</li>
          <li>Ensure compliance with local medical regulations</li>
          <li>Maintain patient confidentiality and HIPAA compliance</li>
          <li>Use appropriate disclaimers in all medical content</li>
        </ul>
      </div>
    </div>
  </div>
);

export function UpdatePromptDialog({
  open,
  onOpenChange,
  content,
  setContent,
  description,
  setDescription,
  promptId,
  currentPrompt,
  onSuccess,
}: UpdatePromptDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [type, setType] = useState<string>('text');
  const [metadata, setMetadata] = useState<any>({});
  const [showMedicalWarning, setShowMedicalWarning] = useState(false);

  // Initialize form with current prompt data
  useEffect(() => {
    if (currentPrompt) {
      setContent(currentPrompt.content);
      setDescription(currentPrompt.description || '');
      setType(currentPrompt.promptType);
      setSelectedTags(currentPrompt.tags.map(tag => tag.name));
      setMetadata(currentPrompt.metadata || {});
    }
  }, [currentPrompt, setContent, setDescription]);

  useEffect(() => {
    setShowMedicalWarning(type === 'medical');
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          description,
          type,
          tags: selectedTags,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create version');
      }

      toast({
        title: 'Success',
        description: 'New version created successfully',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: 'Error',
        description: 'Failed to create version',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col p-0">
        <div className="border-b border-gray-200 p-8 pb-6 dark:border-gray-800">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Sparkles className="h-7 w-7 text-purple-500" />
              Create New Version
            </DialogTitle>
            <DialogDescription className="text-base text-gray-500 dark:text-gray-400">
              Update the content or create a new version of this prompt.
            </DialogDescription>
          </DialogHeader>
        </div>

        {showMedicalWarning && (
          <div className="px-8 pt-8">
            <MedicalDisclaimer />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8">
          <form onSubmit={handleSubmit} className="space-y-8 py-8">
            <div className="space-y-8">
              <div>
                <Label
                  htmlFor="content"
                  className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-200"
                >
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="min-h-[200px] border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-200"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this version changes or improves"
                  className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-1">
                  <Label className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Tags
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Add tags to help categorize your prompt</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-1">
                  <Label className="text-base font-medium text-gray-700 dark:text-gray-200">
                    Prompt Type
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Select the type of content you want to create</TooltipContent>
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon, description, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                        type === value
                          ? `bg-gradient-to-r ${color} border-transparent text-white shadow-lg`
                          : 'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            type === value
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-purple-50 dark:bg-gray-700 dark:group-hover:bg-purple-900/20'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              type === value
                                ? 'text-white'
                                : 'text-gray-600 group-hover:text-purple-600 dark:text-gray-300 dark:group-hover:text-purple-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className={`text-base font-medium ${
                              type === value
                                ? 'text-white'
                                : 'text-gray-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400'
                            }`}
                          >
                            {label}
                          </h3>
                          <p
                            className={`mt-1 text-sm ${
                              type === value
                                ? 'text-white/90'
                                : 'text-gray-500 group-hover:text-purple-500 dark:text-gray-400 dark:group-hover:text-purple-300'
                            }`}
                          >
                            {description}
                          </p>
                        </div>
                        {type === value && (
                          <div className="absolute right-2 top-2">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {type === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Input
                      id="style"
                      value={metadata.style || ''}
                      onChange={e => setMetadata({ ...metadata, style: e.target.value })}
                      placeholder="e.g., realistic, cartoon, watercolor"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resolution">Resolution</Label>
                    <Input
                      id="resolution"
                      value={metadata.resolution || ''}
                      onChange={e => setMetadata({ ...metadata, resolution: e.target.value })}
                      placeholder="e.g., 1024x1024"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="palette">Color Palette</Label>
                    <Input
                      id="palette"
                      value={metadata.palette || ''}
                      onChange={e => setMetadata({ ...metadata, palette: e.target.value })}
                      placeholder="e.g., warm, cool, monochrome"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}

              {type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={metadata.duration || ''}
                      onChange={e => setMetadata({ ...metadata, duration: e.target.value })}
                      placeholder="e.g., 30 seconds"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={metadata.genre || ''}
                      onChange={e => setMetadata({ ...metadata, genre: e.target.value })}
                      placeholder="e.g., documentary, animation"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}

              {type === 'music' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Input
                      id="mood"
                      value={metadata.mood || ''}
                      onChange={e => setMetadata({ ...metadata, mood: e.target.value })}
                      placeholder="e.g., happy, sad, energetic"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      value={metadata.length || ''}
                      onChange={e => setMetadata({ ...metadata, length: e.target.value })}
                      placeholder="e.g., 3 minutes"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instruments">Instruments</Label>
                    <Input
                      id="instruments"
                      value={metadata.instruments || ''}
                      onChange={e => setMetadata({ ...metadata, instruments: e.target.value })}
                      placeholder="e.g., piano, guitar, drums"
                      className="mt-1.5 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-900/50">
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-2.5 text-base text-white hover:from-purple-700 hover:to-pink-700"
              onClick={handleSubmit}
            >
              {isLoading ? 'Creating...' : 'Create Version'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add these styles to your global CSS or create a new style block
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
`;
