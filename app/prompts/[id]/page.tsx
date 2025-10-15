import { PromptViewer } from '@/components/prompts/PromptViewer';

interface PromptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <PromptViewer promptId={id} />
      </div>
    </div>
  );
}
