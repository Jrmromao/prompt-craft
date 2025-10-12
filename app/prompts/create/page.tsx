import { SimplePromptEditor } from '@/components/prompts/SimplePromptEditor';

export default function CreatePromptPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Create New Prompt</h1>
          <p className="text-lg text-muted-foreground">
            Build and save your AI prompts
          </p>
        </div>
        
        <SimplePromptEditor />
      </div>
    </div>
  );
}