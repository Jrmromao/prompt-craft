'use client';

import { CreatePromptDialog } from './CreatePromptDialog';

export function CreatePromptPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create a New Prompt</h1>
        
        <div className="bg-card rounded-lg shadow-lg p-6">
          <CreatePromptDialog />
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <h2 className="font-semibold mb-2">Tips for creating great prompts:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Be specific and clear about what the prompt should achieve</li>
            <li>Include example inputs and expected outputs</li>
            <li>Consider edge cases and limitations</li>
            <li>Add relevant tags to help others find your prompt</li>
            <li>Test your prompt thoroughly before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 