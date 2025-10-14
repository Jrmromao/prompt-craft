'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface EditPromptFormProps {
  prompt: {
    id: string;
    name: string;
    content: string;
    description?: string;
    isPublic: boolean;
    slug: string;
  };
}

export function EditPromptForm({ prompt }: EditPromptFormProps) {
  const router = useRouter();
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
        console.error('API Error:', data);
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

      router.push(`/prompts/${prompt.slug}`);
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error(`Failed to update prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const contentChanged = content !== prompt.content;

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Edit Prompt Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Prompt Name</Label>
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
              className="min-h-[300px] font-mono"
              required
            />
            {contentChanged && (
              <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                ⚠️ Content changed - this will create a new version
              </p>
            )}
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
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Prompt
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
