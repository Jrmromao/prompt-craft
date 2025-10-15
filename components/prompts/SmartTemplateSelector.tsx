'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap,
  Code,
  FileText,
  Brain,
  Target,
  Sparkles,
  BookOpen,
  Lightbulb,
  Filter,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  rating: number;
  uses: number;
  author: string;
  createdAt: string;
  isPremium: boolean;
  variables: string[];
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  onCustomizeTemplate: (template: Template) => void;
}

export function SmartTemplateSelector({ onSelectTemplate, onCustomizeTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Filter },
    { id: 'engineering', name: 'Engineering', icon: Code },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'creative', name: 'Creative Writing', icon: FileText },
    { id: 'analysis', name: 'Data Analysis', icon: BarChart3 },
    { id: 'education', name: 'Education', icon: BookOpen },
    { id: 'business', name: 'Business', icon: Target },
    { id: 'technical', name: 'Technical', icon: Brain }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
      setFilteredTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to mock data
      setTemplates(getMockTemplates());
      setFilteredTemplates(getMockTemplates());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockTemplates = (): Template[] => [
    {
      id: '1',
      title: 'Code Review Assistant',
      description: 'Get detailed code reviews with specific improvement suggestions',
      category: 'engineering',
      prompt: 'Review the following code and provide detailed feedback on:\n1. Code quality and best practices\n2. Performance optimizations\n3. Security considerations\n4. Readability improvements\n\nCode: {code}',
      tags: ['code', 'review', 'quality', 'best-practices'],
      difficulty: 'intermediate',
      popularity: 95,
      rating: 4.8,
      uses: 1250,
      author: 'TechCorp',
      createdAt: '2024-01-15',
      isPremium: false,
      variables: ['code']
    },
    {
      id: '2',
      title: 'Marketing Copy Generator',
      description: 'Create compelling marketing copy for any product or service',
      category: 'marketing',
      prompt: 'Create engaging marketing copy for {product} targeting {audience}. Include:\n- Attention-grabbing headline\n- Key benefits and features\n- Call-to-action\n- Emotional appeal\n\nProduct: {product}\nTarget Audience: {audience}',
      tags: ['marketing', 'copy', 'sales', 'conversion'],
      difficulty: 'beginner',
      popularity: 88,
      rating: 4.6,
      uses: 2100,
      author: 'MarketingPro',
      createdAt: '2024-01-10',
      isPremium: false,
      variables: ['product', 'audience']
    },
    {
      id: '3',
      title: 'Data Analysis Report',
      description: 'Generate comprehensive data analysis reports with insights',
      category: 'analysis',
      prompt: 'Analyze the following dataset and create a comprehensive report:\n\n1. Executive Summary\n2. Key Findings\n3. Trends and Patterns\n4. Recommendations\n5. Visualizations needed\n\nData: {data}\nContext: {context}',
      tags: ['data', 'analysis', 'report', 'insights'],
      difficulty: 'advanced',
      popularity: 76,
      rating: 4.9,
      uses: 890,
      author: 'DataExpert',
      createdAt: '2024-01-20',
      isPremium: true,
      variables: ['data', 'context']
    },
    {
      id: '4',
      title: 'Creative Story Generator',
      description: 'Generate creative stories with specific themes and characters',
      category: 'creative',
      prompt: 'Write a creative story with the following elements:\n- Genre: {genre}\n- Main character: {character}\n- Setting: {setting}\n- Theme: {theme}\n- Length: {length}\n\nMake it engaging and original.',
      tags: ['creative', 'story', 'writing', 'fiction'],
      difficulty: 'beginner',
      popularity: 92,
      rating: 4.7,
      uses: 3400,
      author: 'CreativeWriter',
      createdAt: '2024-01-05',
      isPremium: false,
      variables: ['genre', 'character', 'setting', 'theme', 'length']
    },
    {
      id: '5',
      title: 'Technical Documentation',
      description: 'Generate comprehensive technical documentation for APIs and systems',
      category: 'technical',
      prompt: 'Create technical documentation for {system} including:\n\n1. Overview and Architecture\n2. API Endpoints\n3. Authentication\n4. Error Handling\n5. Examples and Use Cases\n6. Troubleshooting\n\nSystem: {system}\nAPI Details: {apiDetails}',
      tags: ['technical', 'documentation', 'api', 'developer'],
      difficulty: 'advanced',
      popularity: 83,
      rating: 4.8,
      uses: 1560,
      author: 'DevDocs',
      createdAt: '2024-01-12',
      isPremium: true,
      variables: ['system', 'apiDetails']
    }
  ];

  // Filter templates based on search and filters
  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, selectedDifficulty, templates]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Find the Perfect Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {difficulties.map(difficulty => (
              <Button
                key={difficulty.id}
                variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty.id)}
              >
                {difficulty.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                {template.isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg font-mono">
                  {template.prompt.substring(0, 150)}...
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {template.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {template.uses}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {template.popularity}%
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onCustomizeTemplate(template)}
                  >
                    <Target className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
