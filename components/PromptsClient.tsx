"use client";
import { PromptManager } from '@/components/PromptManager';
import { usePrompts } from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type PromptsClientProps = {
  mode: 'create' | 'full';
};

export function PromptsClient({ mode }: PromptsClientProps) {
  const {
    prompts,
    isLoading,
    error,
    savePrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Prompt</h1>
          <Button asChild variant="outline">
            <Link href="/pricing">
              Upgrade to access prompt history
            </Link>
          </Button>
        </div>
        <PromptManager
          prompts={[]}
          isLoading={false}
          onSave={savePrompt}
          onEdit={() => {}}
          onDelete={() => {}}
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
      />
    </div>
  );
} 