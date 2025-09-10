'use client';
import { PromptManager } from '@/components/PromptManager';
import { usePrompts } from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { ErrorMessage } from '@/components/ui/error-message';
import { ContentOrganizer } from '@/components/organization/ContentOrganizer';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type PromptsClientProps = {
  mode: 'create' | 'full';
};

export function PromptsClient({ mode }: PromptsClientProps) {
  const { prompts, isLoading, error, savePrompt, updatePrompt, deletePrompt } = usePrompts();
  const { user, isLoading: authLoading } = useAuth();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorMessage
          variant="error"
          title="Failed to load prompts"
          message={error}
          actions={[
            {
              label: "Try Again",
              onClick: () => window.location.reload()
            }
          ]}
        />
      </div>
    );
  }

  if (isLoading && mode === 'full') {
    return (
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ContentOrganizer />
        </div>
        <div className="lg:col-span-3">
          <PromptManager
            prompts={prompts}
            isLoading={isLoading}
            onSave={savePrompt}
            onEdit={updatePrompt}
            onDelete={deletePrompt}
            mode="full"
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  );
}
