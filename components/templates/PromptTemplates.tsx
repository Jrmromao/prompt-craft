'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Copy, Star } from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  'All',
  'Writing',
  'Marketing',
  'Code',
  'Analysis',
  'Creative',
  'Business',
  'Education'
];

const PROMPT_TEMPLATES = [
  {
    id: '1',
    title: 'Blog Post Writer',
    description: 'Generate engaging blog posts on any topic',
    category: 'Writing',
    template: 'Write a comprehensive blog post about {topic}. Include an engaging introduction, 3-5 main points with examples, and a compelling conclusion. Target audience: {audience}. Tone: {tone}.',
    variables: ['topic', 'audience', 'tone'],
    rating: 4.8,
    uses: 1250
  },
  {
    id: '2',
    title: 'Social Media Caption',
    description: 'Create compelling social media captions',
    category: 'Marketing',
    template: 'Create an engaging {platform} caption for {content_type} about {topic}. Include relevant hashtags and a call-to-action. Tone: {tone}. Character limit: {limit}.',
    variables: ['platform', 'content_type', 'topic', 'tone', 'limit'],
    rating: 4.6,
    uses: 890
  },
  {
    id: '3',
    title: 'Code Reviewer',
    description: 'Review and improve code quality',
    category: 'Code',
    template: 'Review this {language} code for best practices, performance, and security issues. Provide specific suggestions for improvement:\n\n{code}',
    variables: ['language', 'code'],
    rating: 4.9,
    uses: 567
  },
  {
    id: '4',
    title: 'Creative Story Generator',
    description: 'Generate creative stories with specific elements',
    category: 'Creative',
    template: 'Write a {genre} story about {character} who {situation}. Setting: {setting}. Include themes of {themes}. Length: {length} words.',
    variables: ['genre', 'character', 'situation', 'setting', 'themes', 'length'],
    rating: 4.7,
    uses: 423
  }
];

export function PromptTemplates({ onUseTemplate }: { onUseTemplate: (template: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTemplates = PROMPT_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
                <span>{template.uses} uses</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                {template.template}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onUseTemplate(template.template)}
                  className="flex-1"
                >
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTemplate(template.template)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No templates found matching your criteria.
        </div>
      )}
    </div>
  );
}
