import { SimplePromptEditor } from '@/components/prompts/SimplePromptEditor';

export default function CreatePromptPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <SimplePromptEditor />
      </div>
    </div>
  );
}
