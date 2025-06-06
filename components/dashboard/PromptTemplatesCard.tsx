import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { format } from 'date-fns';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  updatedAt: Date;
}

const mockTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    title: 'Blog Post Outline',
    description: 'Generate a detailed outline for a blog post on any topic.',
    updatedAt: new Date('2024-06-06T10:00:00Z'),
  },
  {
    id: 'template-2',
    title: 'Product Description',
    description: 'Create a compelling product description for e-commerce.',
    updatedAt: new Date('2024-06-05T15:30:00Z'),
  },
  {
    id: 'template-3',
    title: 'Email Subject Line',
    description: 'Suggest catchy subject lines for marketing emails.',
    updatedAt: new Date('2024-06-04T09:20:00Z'),
  },
];

export function PromptTemplatesCard() {
  const [templates, setTemplates] = useState(mockTemplates);

  return (
    <Card className="rounded-2xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-900 dark:bg-[#18122B]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="mb-0 text-2xl font-bold text-purple-700 dark:text-purple-300">
            Prompt Templates
          </h2>
        </div>
        <Button className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-purple-700">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </div>
      <div className="space-y-4">
        {templates.map(template => (
          <div
            key={template.id}
            className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 shadow-sm dark:border-purple-900 dark:bg-purple-950/60"
          >
            <div>
              <div className="mb-1 text-lg font-semibold text-purple-900 dark:text-purple-100">
                {template.title}
              </div>
              <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
                {template.description}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {format(new Date(template.updatedAt), 'yyyy-MM-dd')}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-purple-100 dark:hover:bg-purple-900"
              >
                <Edit className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-pink-100 dark:hover:bg-pink-900"
              >
                <Trash2 className="h-4 w-4 text-pink-600 dark:text-pink-300" />
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            No templates yet. Click{' '}
            <span className="font-semibold text-purple-600 dark:text-purple-300">New Template</span>{' '}
            to create your first one!
          </div>
        )}
      </div>
    </Card>
  );
}
