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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Info,
  BookOpen,
  Image,
  Video,
  Music,
  Code,
  Stethoscope,
} from 'lucide-react';
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
        throw new Error('Failed to update prompt');
      }

      toast.success('Prompt updated successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Update Prompt</DialogTitle>
          <DialogDescription>
            Make changes to your prompt. All changes will be saved as a new version.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Enter your prompt content..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter a description for your prompt..."
              />
            </div>

            <div>
              <Label>Type</Label>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {TYPE_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      'relative cursor-pointer rounded-lg border p-4 transition-all hover:border-primary',
                      type === option.value && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setType(option.value)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'rounded-lg bg-gradient-to-br p-2 text-white',
                          option.color
                        )}
                      >
                        <option.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {type === option.value && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {showMedicalWarning && <MedicalDisclaimer />}

            <div>
              <Label>Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
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
