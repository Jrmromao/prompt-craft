'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Globe, Lock, Plus, Download } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SimplePromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<{planType: string, promptsUsed: number, promptsRemaining: number | string} | null>(null);

  useEffect(() => {
    fetchPrompts();
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const planType = data.data.user.planType;
          const promptsUsed = prompts.length;
          const promptsRemaining = planType === 'PRO' ? 'unlimited' : Math.max(0, 10 - promptsUsed);
          
          setUserPlan({ planType, promptsUsed, promptsRemaining });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      } else {
        toast.error('Failed to fetch prompts');
      }
    } catch (error) {
      toast.error('Error loading prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const exportPrompts = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      prompts: prompts.map(prompt => ({
        name: prompt.name,
        description: prompt.description,
        created_at: prompt.createdAt,
        is_public: prompt.isPublic
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompts exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Prompts</h2>
          {userPlan && (
            <p className="text-sm text-gray-600 mt-1">
              {userPlan.planType === 'PRO' ? (
                <span className="text-green-600">PRO Plan - Unlimited prompts</span>
              ) : (
                <span>
                  Free Plan - {userPlan.promptsUsed}/10 prompts used
                  {userPlan.promptsRemaining === 0 && (
                    <span className="text-red-600 ml-2">Limit reached!</span>
                  )}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {prompts.length > 0 && (
            <Button variant="outline" onClick={exportPrompts} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
          {(!userPlan || userPlan.planType === 'PRO' || userPlan.promptsRemaining > 0) ? (
            <Link href="/prompts/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New
              </Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button className="flex items-center gap-2">
                Upgrade to PRO
              </Button>
            </Link>
          )}
        </div>
      </div>

      {prompts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No prompts yet</p>
            <Link href="/prompts/create">
              <Button>Create Your First Prompt</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{prompt.name}</CardTitle>
                  <Badge variant={prompt.isPublic ? "default" : "secondary"} className="flex items-center gap-1">
                    {prompt.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {prompt.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{prompt.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
