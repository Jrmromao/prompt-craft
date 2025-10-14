import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { EditPromptForm } from '@/components/prompts/EditPromptForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditPromptPageProps {
  params: Promise<{ id: string }>;
}

async function getPrompt(id: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) return null;

    const prompt = await prisma.prompt.findFirst({
      where: { 
        OR: [
          { slug: id, userId: user.id },
          { id: id, userId: user.id }
        ]
      },
      select: {
        id: true,
        name: true,
        content: true,
        description: true,
        isPublic: true,
        slug: true,
      }
    });

    return prompt;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return null;
  }
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      notFound();
    }

    const { id } = await params;
    const prompt = await getPrompt(id, userId);

    if (!prompt) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={`/prompts/${prompt.slug}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Prompt
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Prompt</h1>
            <p className="text-muted-foreground mt-2">
              Make changes to your prompt. Content changes will create a new version.
            </p>
          </div>
          <EditPromptForm prompt={prompt} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in EditPromptPage:', error);
    notFound();
  }
}
