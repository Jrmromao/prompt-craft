import { SimplePromptEditor } from '@/components/prompts/SimplePromptEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePromptPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/prompts">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prompts
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Create New Prompt</h1>
        </div>
        <SimplePromptEditor />
      </div>
    </div>
  );
}
