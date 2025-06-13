import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { PlanType } from '@prisma/client';
import { PLANS } from '@/app/constants/plans';

interface PromptCreateFormProps {
  user: {
    id: string;
    planType: string;
  };
  privatePromptCount: number;
}

export function PromptCreateForm({ user, privatePromptCount }: PromptCreateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const isFreeUser = user.planType === PlanType.FREE;
  const remainingPrivatePrompts = isFreeUser ? 3 - privatePromptCount : Infinity;
  const canCreatePrivatePrompt = !isFreeUser || remainingPrivatePrompts > 0;

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
          name,
          description,
          content,
          isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create prompt');
      }

      toast.success('Prompt created successfully');
      router.push(`/prompts/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter prompt name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter prompt description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter prompt content"
          required
          className="min-h-[200px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={!canCreatePrivatePrompt}
        />
        <Label htmlFor="isPublic">
          Make this prompt public
          {isFreeUser && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({remainingPrivatePrompts} private prompts remaining this month)
            </span>
          )}
        </Label>
      </div>

      {!canCreatePrivatePrompt && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Private Prompt Limit Reached
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You've reached your limit of 3 private prompts for this month. 
                  Please upgrade your plan to create more private prompts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading || (!isPublic && !canCreatePrivatePrompt)}>
        {isLoading ? 'Creating...' : 'Create Prompt'}
      </Button>
    </form>
  );
} 