'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

interface EditPromptDialogProps {
  prompt: {
    id: string;
    name: string;
    content: string;
    description?: string;
    isPublic: boolean;
  };
  onUpdate?: () => void;
}

export function EditPromptDialog({ prompt, onUpdate }: EditPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(prompt.name);
  const [content, setContent] = useState(prompt.content);
  const [description, setDescription] = useState(prompt.description || '');
  const [isPublic, setIsPublic] = useState(prompt.isPublic);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          content,
          description,
          isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'VERSION_LIMIT_REACHED') {
          toast.error(data.error, {
            action: {
              label: 'Upgrade',
              onClick: () => window.open('/pricing', '_blank'),
            },
          });
        } else {
          toast.error(data.error || 'Failed to update prompt');
        }
        return;
      }

      if (data.versionCreated) {
        toast.success('Prompt updated and new version created!');
      } else {
        toast.success('Prompt updated successfully!');
      }

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter prompt name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this prompt does"
            />
          </div>

          <div>
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt content here..."
              className="min-h-[200px]"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              {content !== prompt.content ? 
                '⚠️ Content changed - this will create a new version' : 
                'No changes to content'
              }
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">Make this prompt public</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Prompt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
