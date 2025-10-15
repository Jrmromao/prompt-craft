'use client';

import { useState } from 'react';
import { PROMPT_TEMPLATES, TEMPLATE_CATEGORIES, PromptTemplate } from '@/lib/data/promptTemplates';
import { FileText, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (template: PromptTemplate) => void;
  onStartFromScratch: () => void;
}

export function TemplateSelector({ onSelect, onStartFromScratch }: TemplateSelectorProps) {
  const [category, setCategory] = useState('All');

  const filtered = category === 'All'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter(t => t.category === category);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose a Template</h1>
        <p className="text-gray-600">Start with a template or create from scratch</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filtered.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="border-2 rounded-lg p-4 text-left hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
            <h3 className="font-bold mb-1 group-hover:text-purple-600 transition-colors">
              {template.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onStartFromScratch}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Start from Scratch</span>
        </button>
      </div>
    </div>
  );
}
