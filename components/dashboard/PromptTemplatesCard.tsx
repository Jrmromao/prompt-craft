import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import React, { useState } from "react";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  updatedAt: Date;
}

const mockTemplates: PromptTemplate[] = [
  {
    id: "template-1",
    title: "Blog Post Outline",
    description: "Generate a detailed outline for a blog post on any topic.",
    updatedAt: new Date("2024-06-06T10:00:00Z"),
  },
  {
    id: "template-2",
    title: "Product Description",
    description: "Create a compelling product description for e-commerce.",
    updatedAt: new Date("2024-06-05T15:30:00Z"),
  },
  {
    id: "template-3",
    title: "Email Subject Line",
    description: "Suggest catchy subject lines for marketing emails.",
    updatedAt: new Date("2024-06-04T09:20:00Z"),
  },
];

export function PromptTemplatesCard() {
  const [templates, setTemplates] = useState(mockTemplates);

  return (
    <Card className="p-6 bg-white dark:bg-[#18122B] border border-purple-100 dark:border-purple-900 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-0">Prompt Templates</h2>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>
      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/60 rounded-xl px-4 py-3 shadow-sm border border-purple-100 dark:border-purple-900">
            <div>
              <div className="font-semibold text-lg text-purple-900 dark:text-purple-100 mb-1">{template.title}</div>
              <div className="text-gray-700 dark:text-gray-300 text-sm mb-1">{template.description}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Last updated: {template.updatedAt.toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="hover:bg-purple-100 dark:hover:bg-purple-900">
                <Edit className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-pink-100 dark:hover:bg-pink-900">
                <Trash2 className="w-4 h-4 text-pink-600 dark:text-pink-300" />
              </Button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="text-center text-gray-400 py-8">No templates yet. Click <span className="font-semibold text-purple-600 dark:text-purple-300">New Template</span> to create your first one!</div>
        )}
      </div>
    </Card>
  );
} 