'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlanType } from '@prisma/client';
import { PLANS } from '@/app/constants/plans';
import { Settings2 } from 'lucide-react';

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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // AI Settings
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0);
  const [presencePenalty, setPresencePenalty] = useState(0);

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
          temperature,
          topP,
          frequencyPenalty,
          presencePenalty,
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

      {/* Advanced AI Settings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Advanced AI Settings</CardTitle>
            <CardDescription>Fine-tune the AI's response generation</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        {showAdvancedSettings && (
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature}</span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={([value]) => setTemperature(value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Controls randomness: Lower values are more focused, higher values more creative
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="topP">Top P</Label>
                <span className="text-sm text-muted-foreground">{topP}</span>
              </div>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.1}
                value={[topP]}
                onValueChange={([value]) => setTopP(value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                <span className="text-sm text-muted-foreground">{frequencyPenalty}</span>
              </div>
              <Slider
                id="frequencyPenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[frequencyPenalty]}
                onValueChange={([value]) => setFrequencyPenalty(value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Reduces repetition of the same line verbatim
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="presencePenalty">Presence Penalty</Label>
                <span className="text-sm text-muted-foreground">{presencePenalty}</span>
              </div>
              <Slider
                id="presencePenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[presencePenalty]}
                onValueChange={([value]) => setPresencePenalty(value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Reduces repetition of similar topics
              </p>
            </div>
          </CardContent>
        )}
      </Card>

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