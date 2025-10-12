import { SimplePromptList } from '@/components/prompts/SimplePromptList';

export default function PromptsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <SimplePromptList />
      </div>
    </div>
  );
}
