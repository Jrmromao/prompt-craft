'use client';
import { PromptManager } from '@/components/PromptManager';
import { usePrompts } from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

type PromptsClientProps = {
  mode: 'create' | 'full';
};

export function PromptsClient({ mode }: PromptsClientProps) {
  const { prompts, isLoading, error, savePrompt, updatePrompt, deletePrompt } = usePrompts();
  const { userId } = useAuth();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="container mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Prompt</h1>
          <Button asChild variant="outline">
            <Link href="/pricing">Upgrade to access prompt history</Link>
          </Button>
        </div>
        <PromptManager
          prompts={[]}
          isLoading={false}
          onSave={savePrompt}
          onEdit={updatePrompt}
          onDelete={deletePrompt}
          mode="create"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PromptManager
        prompts={prompts}
        isLoading={isLoading}
        onSave={savePrompt}
        onEdit={updatePrompt}
        onDelete={deletePrompt}
        mode="full"
        currentUserId={typeof userId === 'string' ? userId : undefined}
      />
    </div>
  );
}
