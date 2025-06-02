'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreatePromptDialog } from '@/components/prompts/CreatePromptDialog';

interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
}

export default function PromptsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">AI Prompts</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex items-center"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Prompt
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                theme === 'dark' ? 'bg-[#18122B] border-[#2A1A4D]' : 'bg-white'
              }`}
              onClick={() => router.push(`/prompts/${prompt.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{prompt.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/prompts/${prompt.id}`);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              {prompt.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">{prompt.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
                {prompt.isPublic && (
                  <Badge variant="outline" className="border-purple-500 text-purple-500">
                    Public
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <CreatePromptDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchPrompts}
      />
    </div>
  );
} 