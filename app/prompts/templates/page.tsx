'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Lightbulb,
  TestTube,
  Trophy,
  Search,
  Star,
  User,
  ChevronRight,
  Loader2,
  Zap,
  Layers,
  GitBranch,
  type LucideIcon,
  X,
  Check,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { TemplateService } from '@/lib/services/templateService';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, useUser } from '@clerk/nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

interface Template {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  content: string;
  type: 'zero-shot' | 'few-shot' | 'chain-of-thought';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  example: string;
  bestPractices: string[];
  successMetrics: {
    clarity: number;
    specificity: number;
    effectiveness: number;
  };
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

interface PromptType {
  id: 'zero-shot' | 'few-shot' | 'chain-of-thought';
  name: string;
  icon: LucideIcon;
  description: string;
}

const promptTypes: PromptType[] = [
  {
    id: 'zero-shot',
    name: 'Zero-Shot Prompts',
    icon: Zap,
    description: 'Direct instructions without examples. Best for simple, straightforward tasks where the AI can understand the request immediately.'
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Prompts',
    icon: Layers,
    description: 'Includes examples to guide the AI. Perfect for complex tasks where showing examples helps the AI understand the desired format and style.'
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    icon: GitBranch,
    description: 'Step-by-step reasoning prompts that break down complex problems. Ideal for tasks requiring logical thinking and detailed explanations.'
  }
];

const templateService = new TemplateService();

export default function TemplateLibrary() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: clerkUser } = useUser();
  const user = clerkUser ? {
    name: clerkUser.fullName || 'User',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    imageUrl: clerkUser.imageUrl
  } : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'zero-shot' | 'few-shot' | 'chain-of-thought' | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);

  useEffect(() => {
    loadTemplates();
    loadPopularTemplates();
  }, [selectedType, searchQuery]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      console.log('Frontend: Loading templates with filters:', { type: selectedType, search: searchQuery });
      
      const data = await templateService.getTemplates({
        type: selectedType || undefined,
        search: searchQuery || undefined,
      });
      
      console.log('Frontend: Received templates:', data);
      setTemplates(data as Template[]);
    } catch (error) {
      console.error('Frontend: Error loading templates:', error);
      toast({
        title: "Error Loading Templates",
        description: error instanceof Error ? error.message : "Failed to load templates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularTemplates = async () => {
    try {
      console.log('Frontend: Loading popular templates');
      const data = await templateService.getPopularTemplates();
      console.log('Frontend: Received popular templates:', data);
      setPopularTemplates(data as Template[]);
    } catch (error) {
      console.error('Frontend: Error loading popular templates:', error);
      toast({
        title: "Error Loading Popular Templates",
        description: error instanceof Error ? error.message : "Failed to load popular templates. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    try {
      router.push(`/prompts/create?template=${template.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select template",
        variant: "destructive",
      });
    }
  };

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-pink-50/80 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-inter">
            Prompt Engineering Templates
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">
            Master the art of prompt engineering with our curated collection of effective templates
          </p>
        </div>

        {/* Prompt Types Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promptTypes.map((type, index) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`relative group cursor-pointer ${
                  selectedType === type.id ? 'md:scale-105' : ''
                } transition-all duration-300`}
              >
                {/* Card Container */}
                <div className={`h-full p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedType === type.id
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20'
                    : 'border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}>
                  {/* Icon Container */}
                  <div className={`mb-4 p-3 rounded-xl inline-flex ${
                    selectedType === type.id
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  }`}>
                    <type.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-semibold mb-2 font-inter ${
                    selectedType === type.id
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm font-inter ${
                    selectedType === type.id
                      ? 'text-purple-600/80 dark:text-purple-400/80'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {type.description}
                  </p>

                  {/* Selection Indicator */}
                  {selectedType === type.id && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                    selectedType === type.id
                      ? 'opacity-0'
                      : 'opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-500/5 to-pink-500/5'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border-purple-200 focus:border-purple-500 dark:border-purple-800 dark:focus:border-purple-400 font-inter rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search templates"
                />
              </div>

              {/* Filter Dropdown */}
              <Select
                value={selectedType || 'all'}
                onValueChange={(value: string) => setSelectedType(value === 'all' ? null : value as "zero-shot" | "few-shot" | "chain-of-thought")}
              >
                <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>All Templates</span>
                    </div>
                  </SelectItem>
                  {promptTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Button */}
              {(searchQuery || selectedType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

      

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Popular Templates */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-inter">Popular Templates</h2>
                  <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 font-inter">
                    Trending
                  </Badge>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-purple-100 dark:bg-purple-900 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-purple-100 dark:bg-purple-900 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : (
                    popularTemplates.map(template => (
                      <div 
                        key={template.id} 
                        className="group flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50/40 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-100 dark:border-purple-900 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white font-inter group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                              {template.name}
                            </h3>
                            <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 font-inter">
                              {template.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-inter line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors duration-300">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                              <Star className="h-3 w-3 mr-1" />
                              {template.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                              <Zap className="h-3 w-3 mr-1" />
                              {template.usageCount} uses
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 dark:bg-gray-800 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-gray-700 font-inter transition-all duration-300 hover:scale-105"
                          onClick={() => handleTemplateSelect(template)}
                          aria-label={`Use template: ${template.name}`}
                        >
                          Use
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Templates */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden border-purple-100 dark:border-purple-900 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 w-3/4 bg-purple-100 dark:bg-purple-900 rounded mb-4"></div>
                      <div className="h-4 w-full bg-purple-100 dark:bg-purple-900 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-purple-100 dark:bg-purple-900 rounded mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 w-20 bg-purple-100 dark:bg-purple-900 rounded"></div>
                        <div className="h-6 w-20 bg-purple-100 dark:bg-purple-900 rounded"></div>
                      </div>
                      <div className="h-10 w-full bg-purple-100 dark:bg-purple-900 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : templates.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900">
                  <BookOpen className="h-12 w-12 mx-auto text-purple-400 dark:text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white font-inter">No Templates Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-inter">
                    Try adjusting your search criteria or browse our categories
                  </p>
                </div>
              ) : (
                templates.map((template: Template) => (
                  <Card 
                    key={template.id} 
                    className="overflow-hidden border-purple-100 dark:border-purple-900 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-inter">{template.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 font-inter">
                            {template.type}
                          </Badge>
                          <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 font-inter">
                            {template.complexity}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Example Section */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white font-inter flex items-center">
                            <TestTube className="h-4 w-4 mr-2" />
                            Example
                          </h4>
                          <div className="bg-gradient-to-r from-purple-50/40 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 p-3 rounded border border-purple-100 dark:border-purple-900">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-inter">{template.example}</p>
                          </div>
                        </div>

                        {/* Best Practices */}
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white font-inter flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Best Practices
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 font-inter space-y-1">
                            {template.bestPractices.map((practice, i) => (
                              <li key={i}>{practice}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Success Metrics */}
                        {template.successMetrics && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white font-inter flex items-center">
                              <Trophy className="h-4 w-4 mr-2" />
                              Success Metrics
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">Clarity</span>
                                <Progress value={template.successMetrics.clarity} className="w-32 bg-purple-100 dark:bg-purple-900" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">Specificity</span>
                                <Progress value={template.successMetrics.specificity} className="w-32 bg-purple-100 dark:bg-purple-900" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">Effectiveness</span>
                                <Progress value={template.successMetrics.effectiveness} className="w-32 bg-purple-100 dark:bg-purple-900" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-inter"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-inter transition-all duration-300 hover:scale-105"
                            onClick={() => handleTemplateSelect(template)}
                            aria-label={`Use template: ${template.name}`}
                          >
                            Use Template
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-gray-800 font-inter transition-all duration-300 hover:scale-105"
                            aria-label={`Learn more about ${template.name}`}
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 