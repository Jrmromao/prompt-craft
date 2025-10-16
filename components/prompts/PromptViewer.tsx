'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VersionControl } from './VersionControl';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Download, Edit, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Prompt {
  id: string;
  name: string;
  content: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

interface PromptViewerProps {
  promptId: string; // This can now be either slug or ID
}

export function PromptViewer({ promptId }: PromptViewerProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO'>('FREE');
  const [userLimits, setUserLimits] = useState({ versionsUsed: 0, maxVersionsPerPrompt: 3 });

  useEffect(() => {
    fetchPrompt();
    fetchUserInfo();
  }, [promptId]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const user = await response.json();
        const isPro = user.Subscription?.status === 'ACTIVE' || user.planType === 'PRO';
        setUserPlan(isPro ? 'PRO' : 'FREE');
        setUserLimits({
          versionsUsed: user.versionsUsed || 0,
          maxVersionsPerPrompt: user.maxVersionsPerPrompt || 3
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`);
      if (response.ok) {
        const data = await response.json();
        setPrompt(data);
      } else {
        toast.error('Failed to load prompt');
      }
    } catch (error) {
      toast.error('Error loading prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.content);
      toast.success('Prompt copied to clipboard!');
    }
  };

  const handleExport = () => {
    if (prompt) {
      // Export as markdown
      const markdownContent = `# ${prompt.name}

${prompt.description ? `## Description\n${prompt.description}\n\n` : ''}## Prompt Content

${prompt.content}

---
*Created: ${new Date(prompt.createdAt).toLocaleDateString()}*  
*Updated: ${new Date(prompt.updatedAt).toLocaleDateString()}*`;
      
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slug || 'prompt'}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Prompt exported as markdown!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground mb-4">Prompt not found</p>
            <Link href="/dashboard">
              <Button>Back to Prompts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Prompts
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href={`/prompts/${promptId}/edit`}>
            <Button size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Prompt Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{prompt.name}</CardTitle>
                  {prompt.description && (
                    <p className="text-muted-foreground">{prompt.description}</p>
                  )}
                </div>
                <Badge variant={prompt.isPublic ? "default" : "secondary"} className="flex items-center gap-1">
                  {prompt.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {prompt.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prompt Content</h3>
                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-medium mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-200 px-1 rounded text-sm" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto" {...props} />
                    }}
                  >
                    {prompt.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(prompt.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version Control Sidebar */}
        <div className="lg:col-span-1">
          <VersionControl
            promptId={prompt.id}
            currentContent={prompt.content}
            onVersionSelect={(content) => setPrompt(prev => prev ? { ...prev, content } : null)}
            userPlan={userPlan}
            versionsUsed={userLimits.versionsUsed}
            maxVersions={userLimits.maxVersionsPerPrompt}
          />
        </div>
      </div>
    </div>
  );
}
