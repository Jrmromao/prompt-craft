'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

const PROVEN_TEMPLATES = [
  {
    id: 'viral-content',
    name: 'Viral Content Creator',
    category: 'Marketing',
    uses: '12.3k',
    rating: 4.9,
    template: `Create viral content about [TOPIC] for [PLATFORM].

Hook: Start with a surprising fact or question
Value: Provide 3-5 actionable insights
Engagement: End with a question or call-to-action

Target audience: [AUDIENCE]
Tone: [TONE]
Length: [LENGTH]`,
    variables: ['TOPIC', 'PLATFORM', 'AUDIENCE', 'TONE', 'LENGTH']
  },
  {
    id: 'sales-email',
    name: 'High-Converting Sales Email',
    category: 'Sales',
    uses: '8.7k',
    rating: 4.8,
    template: `Write a sales email for [PRODUCT/SERVICE].

Subject: Create urgency without being pushy
Opening: Personalize with [PAIN POINT]
Value: Focus on specific benefits for [TARGET]
Social proof: Mention results/testimonials
CTA: Single, clear action

Tone: Professional but friendly
Length: Under 150 words`,
    variables: ['PRODUCT/SERVICE', 'PAIN POINT', 'TARGET']
  },
  {
    id: 'code-reviewer',
    name: 'Code Review Expert',
    category: 'Development',
    uses: '15.2k',
    rating: 4.9,
    template: `Review this [LANGUAGE] code for [PURPOSE]:

[CODE]

Check for:
- Security vulnerabilities
- Performance issues
- Best practices
- Code readability
- Potential bugs

Provide specific suggestions with examples.`,
    variables: ['LANGUAGE', 'PURPOSE', 'CODE']
  }
];

export function TemplateLibrary() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const fillTemplate = (template: string, vars: Record<string, string>) => {
    let filled = template;
    Object.entries(vars).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`\\[${key}\\]`, 'g'), value || `[${key}]`);
    });
    return filled;
  };

  const copyTemplate = (template: any) => {
    const filled = fillTemplate(template.template, variables);
    navigator.clipboard.writeText(filled);
    toast.success('Template copied!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Proven Templates</h2>
        <p className="text-gray-600">Copy-paste prompts that actually work</p>
      </div>

      <div className="grid gap-4">
        {PROVEN_TEMPLATES.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{template.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </div>
                    <span className="text-sm text-gray-500">{template.uses} uses</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyTemplate(template)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {fillTemplate(template.template, variables)}
              </pre>
              
              {template.variables.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium">Fill in variables:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {template.variables.map((variable) => (
                      <Input
                        key={variable}
                        placeholder={variable}
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
