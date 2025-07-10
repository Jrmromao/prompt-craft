'use client';
import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  HelpCircle,
  Info,
  Sparkles,
  Tag,
  Lock,
  Globe,
  Plus,
  Check,
  BookOpen,
  Image,
  Video,
  Music,
  Code2,
  Stethoscope,
  X,
  ArrowLeft,
  Play,
  Star,
  Clock,
  User,
  FileText,
  History,
  Loader2,
  MessageSquare,
  BarChart,
  PenTool,
  Briefcase,
  GraduationCap,
  Wrench,
  Microscope,
  Settings,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  type LucideIcon,
  Search,
  Filter,
  Settings2,
  AlertCircle,
  Star as StarIcon,
} from 'lucide-react';
import { AIService } from '@/lib/services/aiService';
import { PromptType, LLMType } from '@/types/ai';
import { AVAILABLE_LLMS } from '@/types/ai';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NavBarUser } from '@/components/layout/NavBar';
import { NavBar } from '@/components/layout/NavBar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { InsufficientCreditsDialog } from '@/components/prompts/InsufficientCreditsDialog';
import Playground from '@/components/Playground';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useUser } from '@clerk/nextjs';
import { FloatingWarningBar } from '@/components/support/FloatingWarningBar';
import ReactMarkdown from 'react-markdown';
import { Slider } from '@/components/ui/slider';
import { CreditUsageIndicator } from '@/components/CreditUsageIndicator';
import { CreditUsageNotification } from '@/components/CreditUsageNotification';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { encode } from 'gpt-tokenizer';

interface ExamplePrompt {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  tone?: string;
  format?: string;
  style?: string;
  resolution?: string;
  palette?: string;
  duration?: string;
  genre?: string;
  mood?: string;
  length?: string;
  instruments?: string;
  promptType: PromptType;
  systemPrompt?: string;
  context?: string;
  examples?: string[];
  constraints?: string[];
  outputFormat?: string;
  temperature?: number;
  validationRules?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens?: number;
}

const PROMPT_TYPES: {
  value: PromptType;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  examples: {
    id: string;
    name: string;
    description: string;
    content: string;
    tags: string[];
    tone?: string;
    format?: string;
    promptType: PromptType;
  }[];
}[] = [
  {
    value: 'content-creation',
    label: 'Content Creation',
    icon: BookOpen,
    description: 'Create prompts for articles, blog posts, and general content',
    color: 'from-purple-600 to-pink-600',
    examples: [
      {
        id: 'blog-post-generator',
        name: 'Blog Post Generator',
        description: 'Generate engaging blog posts with SEO optimization',
        content: 'Write a blog post about [topic] that is [tone] and targets [audience]. Include SEO keywords and a clear structure.',
        tags: ['blog-post', 'content-creation', 'seo-optimization', 'writing-guide'],
        tone: 'professional',
        format: 'article',
        promptType: 'content-creation'
      },
      {
        id: 'social-media-post',
        name: 'Social Media Post',
        description: 'Create viral social media content',
        content: 'Create a [platform] post about [topic] that will engage [audience]. Include hashtags and a call to action.',
        tags: ['social-media-post', 'marketing-content', 'engagement-strategy'],
        tone: 'casual',
        format: 'social',
        promptType: 'content-creation'
      },
      {
        id: 'news-article',
        name: 'News Article',
        description: 'Generate news article content',
        content: 'Write a news article about [event] for [publication]. Include key facts, quotes, and context.',
        tags: ['news-article', 'journalism-content', 'writing-guide', 'content-creation'],
        tone: 'objective',
        format: 'news',
        promptType: 'content-creation'
      },
      {
        id: 'product-description',
        name: 'Product Description',
        description: 'Create compelling product descriptions',
        content: 'Write a product description for [product] highlighting [features]. Include benefits and specifications.',
        tags: ['product-description', 'marketing-content', 'sales-guide'],
        tone: 'persuasive',
        format: 'product',
        promptType: 'content-creation'
      }
    ]
  },
  {
    value: 'code-generation',
    label: 'Code Generation',
    icon: Code2,
    description: 'Generate prompts for coding and software development',
    color: 'from-blue-600 to-cyan-600',
    examples: [
      {
        id: 'function-generator',
        name: 'Function Generator',
        description: 'Generate reusable code functions',
        content: 'Create a [language] function that [purpose] with [requirements]. Include error handling and documentation.',
        tags: ['code-function', 'development-guide', 'programming-tool', 'function-template'],
        tone: 'technical',
        format: 'code',
        promptType: 'code-generation'
      },
      {
        id: 'api-integration',
        name: 'API Integration',
        description: 'Generate API integration code',
        content: 'Write code to integrate [API] with [framework] for [purpose]. Include authentication and error handling.',
        tags: ['api-integration', 'backend-development', 'code-template'],
        tone: 'technical',
        format: 'code',
        promptType: 'code-generation'
      },
      {
        id: 'database-query',
        name: 'Database Query',
        description: 'Generate database queries',
        content: 'Create a [database] query to [operation] with [conditions]. Include proper indexing and optimization.',
        tags: ['database-query', 'sql-template', 'code-guide'],
        tone: 'technical',
        format: 'code',
        promptType: 'code-generation'
      },
      {
        id: 'test-case-generator',
        name: 'Test Case Generator',
        description: 'Generate unit test cases',
        content: 'Write test cases for [function/component] covering [scenarios]. Include edge cases and error conditions.',
        tags: ['test-case', 'unit-testing', 'code-quality', 'testing-guide'],
        tone: 'technical',
        format: 'code',
        promptType: 'code-generation'
      }
    ]
  },
  {
    value: 'data-analysis',
    label: 'Data Analysis',
    icon: BarChart,
    description: 'Create prompts for data analysis and visualization',
    color: 'from-green-600 to-emerald-600',
    examples: [
      {
        id: 'data-visualization',
        name: 'Data Visualization',
        description: 'Generate data visualization code',
        content: 'Create a visualization for [dataset] showing [insights]. Use [chart type] and include annotations.',
        tags: ['data-viz', 'visualization-guide', 'analysis-tool', 'chart-template'],
        tone: 'analytical',
        format: 'report',
        promptType: 'data-analysis'
      },
      {
        id: 'statistical-analysis',
        name: 'Statistical Analysis',
        description: 'Generate statistical analysis code',
        content: 'Analyze [dataset] to find [insights]. Include [statistical methods] and present findings clearly.',
        tags: ['statistical-analysis', 'data-insights', 'research-methods'],
        tone: 'analytical',
        format: 'report',
        promptType: 'data-analysis'
      },
      {
        id: 'predictive-model',
        name: 'Predictive Model',
        description: 'Generate predictive modeling code',
        content: 'Create a predictive model for [target] using [features]. Include model evaluation and validation.',
        tags: ['predictive-model', 'ml-template', 'data-science', 'model-guide'],
        tone: 'analytical',
        format: 'report',
        promptType: 'data-analysis'
      },
      {
        id: 'data-cleaning',
        name: 'Data Cleaning',
        description: 'Generate data cleaning scripts',
        content: 'Create a script to clean [dataset] by handling [issues]. Include data validation and transformation.',
        tags: ['data-cleaning', 'preprocessing-guide', 'data-quality', 'cleaning-tool'],
        tone: 'technical',
        format: 'code',
        promptType: 'data-analysis'
      }
    ]
  },
  {
    value: 'creative-writing',
    label: 'Creative Writing',
    icon: PenTool,
    description: 'Generate prompts for stories, poems, and creative content',
    color: 'from-orange-600 to-amber-600',
    examples: [
      {
        id: 'story-generator',
        name: 'Story Generator',
        description: 'Generate creative story ideas',
        content: 'Write a [genre] story about [theme] with [character traits]. Include plot twists and character development.',
        tags: ['story-template', 'creative-writing', 'fiction-guide', 'narrative-tool'],
        tone: 'creative',
        format: 'story',
        promptType: 'creative-writing'
      },
      {
        id: 'poem-generator',
        name: 'Poem Generator',
        description: 'Generate poetry prompts',
        content: 'Create a [poem type] about [theme] using [style]. Include [literary devices] and emotional depth.',
        tags: ['poetry-template', 'creative-writing', 'literary-art', 'poem-guide'],
        tone: 'artistic',
        format: 'poem',
        promptType: 'creative-writing'
      },
      {
        id: 'character-development',
        name: 'Character Development',
        description: 'Generate character profiles',
        content: 'Create a character profile for [character type] with [background]. Include personality and motivations.',
        tags: ['character-profile', 'creative-writing', 'character-guide', 'development-tool'],
        tone: 'creative',
        format: 'profile',
        promptType: 'creative-writing'
      },
      {
        id: 'dialogue-generator',
        name: 'Dialogue Generator',
        description: 'Generate realistic dialogue',
        content: 'Write a dialogue between [characters] about [topic]. Include subtext and emotional undertones.',
        tags: ['dialogue-template', 'creative-writing', 'conversation-guide', 'dialogue-tool'],
        tone: 'natural',
        format: 'dialogue',
        promptType: 'creative-writing'
      }
    ]
  },
  {
    value: 'business',
    label: 'Business',
    icon: Briefcase,
    description: 'Create prompts for business documents and analysis',
    color: 'from-indigo-600 to-violet-600',
    examples: [
      {
        id: 'business-plan',
        name: 'Business Plan',
        description: 'Generate business plan sections',
        content: 'Create a [section] for a business plan about [business type]. Include market analysis and financial projections.',
        tags: ['business', 'planning', 'strategy', 'analysis'],
        tone: 'professional',
        format: 'document',
        promptType: 'business'
      },
      {
        id: 'market-analysis',
        name: 'Market Analysis',
        description: 'Generate market analysis reports',
        content: 'Analyze the market for [product/service] in [market]. Include competitors, trends, and opportunities.',
        tags: ['market', 'analysis', 'business', 'research'],
        tone: 'analytical',
        format: 'report',
        promptType: 'business'
      },
      {
        id: 'financial-report',
        name: 'Financial Report',
        description: 'Generate financial analysis',
        content: 'Create a financial analysis for [company/project] covering [period]. Include key metrics and insights.',
        tags: ['finance', 'analysis', 'business', 'report'],
        tone: 'professional',
        format: 'report',
        promptType: 'business'
      },
      {
        id: 'business-proposal',
        name: 'Business Proposal',
        description: 'Generate business proposals',
        content: 'Write a business proposal for [project] targeting [client]. Include value proposition and timeline.',
        tags: ['proposal', 'business', 'sales', 'document'],
        tone: 'persuasive',
        format: 'proposal',
        promptType: 'business'
      }
    ]
  },
  {
    value: 'education',
    label: 'Education',
    icon: GraduationCap,
    description: 'Generate prompts for educational content and learning materials',
    color: 'from-teal-600 to-cyan-600',
    examples: [
      {
        id: 'lesson-plan',
        name: 'Lesson Plan',
        description: 'Generate lesson plans',
        content: 'Create a lesson plan for [subject] about [topic] for [grade level]. Include objectives and activities.',
        tags: ['education', 'teaching', 'lesson-plan', 'learning'],
        tone: 'educational',
        format: 'lesson',
        promptType: 'education'
      },
      {
        id: 'study-guide',
        name: 'Study Guide',
        description: 'Generate study guides',
        content: 'Create a study guide for [subject] covering [topics]. Include key concepts and practice questions.',
        tags: ['education', 'study', 'learning', 'guide'],
        tone: 'educational',
        format: 'guide',
        promptType: 'education'
      },
      {
        id: 'quiz-generator',
        name: 'Quiz Generator',
        description: 'Generate educational quizzes',
        content: 'Create a quiz for [subject] testing [topics]. Include various question types and difficulty levels.',
        tags: ['education', 'quiz', 'assessment', 'learning'],
        tone: 'educational',
        format: 'quiz',
        promptType: 'education'
      },
      {
        id: 'learning-activity',
        name: 'Learning Activity',
        description: 'Generate interactive learning activities',
        content: 'Design a learning activity for [subject] about [topic]. Include materials and instructions.',
        tags: ['education', 'activity', 'interactive', 'learning'],
        tone: 'engaging',
        format: 'activity',
        promptType: 'education'
      }
    ]
  },
  {
    value: 'technical',
    label: 'Technical',
    icon: Wrench,
    description: 'Create prompts for technical documentation and guides',
    color: 'from-slate-600 to-gray-600',
    examples: [
      {
        id: 'api-documentation',
        name: 'API Documentation',
        description: 'Generate API documentation',
        content: 'Document the [API endpoint] with [parameters]. Include examples and error responses.',
        tags: ['api-documentation', 'technical-doc', 'api-guide', 'endpoint-doc'],
        tone: 'technical',
        format: 'documentation',
        promptType: 'technical'
      },
      {
        id: 'technical-guide',
        name: 'Technical Guide',
        description: 'Generate technical guides',
        content: 'Create a guide for [technology] explaining [concept]. Include setup steps and best practices.',
        tags: ['technical-manual', 'tech-guide', 'setup-guide', 'best-practices'],
        tone: 'technical',
        format: 'guide',
        promptType: 'technical'
      },
      {
        id: 'system-architecture',
        name: 'System Architecture',
        description: 'Generate system architecture documentation',
        content: 'Document the architecture of [system] including [components]. Include diagrams and explanations.',
        tags: ['system-architecture', 'arch-doc', 'system-design', 'component-doc'],
        tone: 'technical',
        format: 'documentation',
        promptType: 'technical'
      },
      {
        id: 'troubleshooting-guide',
        name: 'Troubleshooting Guide',
        description: 'Generate troubleshooting guides',
        content: 'Create a troubleshooting guide for [issue] in [system]. Include common problems and solutions.',
        tags: ['troubleshooting-manual', 'debug-guide', 'support-doc', 'issue-resolution'],
        tone: 'technical',
        format: 'guide',
        promptType: 'technical'
      }
    ]
  },
  {
    value: 'research',
    label: 'Research',
    icon: Microscope,
    description: 'Generate prompts for research papers and analysis',
    color: 'from-red-600 to-rose-600',
    examples: [
      {
        id: 'research-paper',
        name: 'Research Paper',
        description: 'Generate research paper sections',
        content: 'Write the [section] of a research paper about [topic]. Include methodology and findings.',
        tags: ['research-paper', 'academic-paper', 'paper-section', 'research-analysis'],
        tone: 'academic',
        format: 'paper',
        promptType: 'research'
      },
      {
        id: 'literature-review',
        name: 'Literature Review',
        description: 'Generate literature review prompts',
        content: 'Review the literature on [topic] focusing on [aspects]. Include key findings and gaps.',
        tags: ['lit-review', 'academic-review', 'research-summary', 'literature-analysis'],
        tone: 'academic',
        format: 'review',
        promptType: 'research'
      },
      {
        id: 'research-proposal',
        name: 'Research Proposal',
        description: 'Generate research proposals',
        content: 'Write a research proposal for [study] investigating [topic]. Include methodology and timeline.',
        tags: ['research-proposal', 'study-proposal', 'academic-proposal', 'research-plan'],
        tone: 'academic',
        format: 'proposal',
        promptType: 'research'
      },
      {
        id: 'data-analysis-report',
        name: 'Data Analysis Report',
        description: 'Generate research data analysis',
        content: 'Analyze the research data from [study] focusing on [variables]. Include statistical methods and results.',
        tags: ['data-analysis', 'research-stats', 'statistical-report', 'data-report'],
        tone: 'academic',
        format: 'report',
        promptType: 'research'
      }
    ]
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: Settings,
    description: 'Create custom prompts for specific needs',
    color: 'from-gray-600 to-slate-600',
    examples: [
      {
        id: 'custom-template',
        name: 'Custom Template',
        description: 'Create a custom prompt template',
        content: 'Create a [type] about [topic] with [specific requirements]. Include [custom elements].',
        tags: ['custom-template', 'flexible-template', 'specialized-template', 'custom-format'],
        tone: 'customizable',
        format: 'custom',
        promptType: 'custom'
      },
      {
        id: 'specialized-format',
        name: 'Specialized Format',
        description: 'Create a specialized format prompt',
        content: 'Generate content in [specialized format] for [purpose] with [requirements].',
        tags: ['specialized-format', 'custom-format', 'format-template', 'specialized-template'],
        tone: 'customizable',
        format: 'custom',
        promptType: 'custom'
      },
      {
        id: 'industry-specific',
        name: 'Industry-Specific',
        description: 'Create industry-specific prompts',
        content: 'Generate [industry] content about [topic] following [industry standards].',
        tags: ['industry-specific', 'industry-template', 'specialized-industry', 'industry-format'],
        tone: 'professional',
        format: 'custom',
        promptType: 'custom'
      },
      {
        id: 'multi-purpose',
        name: 'Multi-Purpose',
        description: 'Create multi-purpose prompts',
        content: 'Create a versatile prompt for [purposes] that can be adapted for [use cases].',
        tags: ['multi-purpose', 'versatile-template', 'adaptable-format', 'flexible-template'],
        tone: 'flexible',
        format: 'custom',
        promptType: 'custom'
      }
    ]
  }
];

const COMMON_TAGS = [
  'blog-post',
  'content-creation',
  'seo-optimization',
  'writing-guide',
  'social-media-post',
  'marketing-content',
  'engagement-strategy',
  'news-article',
  'journalism-content',
  'product-description',
  'sales-guide',
  'code-function',
  'development-guide',
  'programming-tool',
  'function-template',
  'api-integration',
  'backend-development',
  'code-template',
  'database-query',
  'sql-template',
  'code-guide',
  'test-case',
  'unit-testing',
  'code-quality',
  'testing-guide',
  'data-viz',
  'visualization-guide',
  'analysis-tool',
  'chart-template',
  'statistical-analysis',
  'data-insights',
  'research-methods',
  'predictive-model',
  'ml-template',
  'data-science',
  'model-guide',
  'data-cleaning',
  'preprocessing-guide',
  'data-quality',
  'cleaning-tool',
  'story-template',
  'creative-writing',
  'fiction-guide',
  'narrative-tool',
  'poetry-template',
  'literary-art',
  'poem-guide',
  'character-profile',
  'character-guide',
  'development-tool',
  'dialogue-template',
  'conversation-guide',
  'dialogue-tool',
  'business-plan',
  'planning',
  'strategy',
  'analysis',
  'market-analysis',
  'market-research',
  'business-insights',
  'financial-report',
  'finance-analysis',
  'business-report',
  'business-proposal',
  'proposal-template',
  'sales-document',
  'lesson-plan',
  'teaching-guide',
  'education-template',
  'study-guide',
  'learning-resource',
  'quiz-template',
  'assessment-tool',
  'learning-activity',
  'interactive-learning',
  'api-documentation',
  'technical-doc',
  'api-guide',
  'endpoint-doc',
  'technical-manual',
  'tech-guide',
  'setup-guide',
  'best-practices',
  'system-architecture',
  'arch-doc',
  'system-design',
  'component-doc',
  'troubleshooting-manual',
  'debug-guide',
  'support-doc',
  'issue-resolution',
  'research-paper',
  'academic-paper',
  'paper-section',
  'research-analysis',
  'lit-review',
  'academic-review',
  'research-summary',
  'literature-analysis',
  'research-proposal',
  'study-proposal',
  'academic-proposal',
  'research-plan',
  'data-analysis',
  'research-stats',
  'statistical-report',
  'data-report',
  'custom-template',
  'flexible-template',
  'specialized-template',
  'custom-format',
  'specialized-format',
  'format-template',
  'industry-specific',
  'industry-template',
  'specialized-industry',
  'industry-format',
  'multi-purpose',
  'versatile-template',
  'adaptable-format'
];

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'blog-post-template',
    name: 'Blog Post Template',
    description: 'A template for creating engaging blog posts',
    content: 'Write a blog post about [topic] with [tone] tone for [audience].',
    tags: ['blog-post', 'content-creation', 'writing-guide'],
    tone: 'professional',
    format: 'article',
    promptType: 'content-creation',
  },
  {
    id: 'story-prompt-template',
    name: 'Story Prompt Template',
    description: 'A template for creative story writing',
    content: 'Write a story about [topic] with [genre] elements and [mood] tone.',
    tags: ['story-template', 'creative-writing', 'fiction-guide'],
    tone: 'creative',
    format: 'story',
    promptType: 'creative-writing',
  },
  {
    id: 'business-analysis-prompt',
    name: 'Business Analysis Prompt',
    description: 'A template for business analysis reports',
    content: 'Analyze the business case for [topic] considering [factors].',
    tags: ['business-plan', 'market-analysis', 'business-report'],
    tone: 'professional',
    format: 'article',
    promptType: 'business',
  },
  {
    id: 'code-generation-template',
    name: 'Code Generation Template',
    description: 'A template for generating code snippets',
    content: 'Generate a [language] function that [purpose] with [requirements].',
    tags: ['code-function', 'development-guide', 'programming-tool'],
    tone: 'technical',
    format: 'code',
    promptType: 'code-generation',
  },
  {
    id: 'data-analysis-template',
    name: 'Data Analysis Template',
    description: 'A template for data analysis tasks',
    content: 'Analyze the dataset [description] to find [insights].',
    tags: ['data-viz', 'statistical-analysis', 'data-insights'],
    tone: 'analytical',
    format: 'report',
    promptType: 'data-analysis',
  },
  {
    id: 'educational-content-template',
    name: 'Educational Content Template',
    description: 'A template for creating educational materials',
    content: 'Create an educational resource about [topic] for [audience] level.',
    tags: ['lesson-plan', 'teaching-guide', 'education-template'],
    tone: 'educational',
    format: 'lesson',
    promptType: 'education',
  },
  {
    id: 'technical-documentation-template',
    name: 'Technical Documentation Template',
    description: 'A template for technical documentation',
    content: 'Document the technical specifications for [system/feature].',
    tags: ['api-documentation', 'technical-doc', 'system-architecture'],
    tone: 'technical',
    format: 'documentation',
    promptType: 'technical',
  },
  {
    id: 'research-analysis-template',
    name: 'Research Analysis Template',
    description: 'A template for research analysis',
    content: 'Analyze the research findings on [topic] considering [methodology].',
    tags: ['research-paper', 'academic-paper', 'research-analysis'],
    tone: 'academic',
    format: 'research',
    promptType: 'research',
  },
  {
    id: 'custom-template',
    name: 'Custom Template',
    description: 'A flexible template for custom needs',
    content: 'Create a [type] about [topic] with [specific requirements].',
    tags: ['custom-template', 'flexible-template', 'specialized-template'],
    tone: 'customizable',
    format: 'custom',
    promptType: 'custom',
  },
];

function getRandomSpinnerMessage() {
  const SPINNER_MESSAGES = [
    'Cooking up the perfect prompt… 🍳',
    'Asking the AI for its best-kept secrets… 🤫',
    'Sharpening the pencils in the prompt factory… ✏️',
    'Summoning prompt magic… 🪄',
    'Letting the robots brainstorm… 🤖💡',
  ];
  return SPINNER_MESSAGES[Math.floor(Math.random() * SPINNER_MESSAGES.length)];
}

function getLanguageName(code: string) {
  switch (code) {
    case 'pt':
      return 'português';
    case 'es':
      return 'espanhol';
    case 'fr':
      return 'francês';
    case 'de':
      return 'alemão';
    default:
      return 'inglês';
  }
}

interface FormData {
  name: string;
  description: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  tone: string;
  format: string;
  wordCount: string;
  targetAudience: string;
  includeExamples: boolean;
  includeKeywords: boolean;
  temperature: number;
  language: string;
  promptType: PromptType;
  llm: LLMType;
  persona?: string;
  includeImageDescription?: boolean;
  systemPrompt?: string;
  context?: string;
  examples?: string[];
  constraints?: string[];
  outputFormat?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens?: number;
  validationRules?: string[];
  fallbackStrategy?: string;
}

interface ClientPromptCreateProps {
  user?: NavBarUser;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇬🇧', description: 'English (US)' },
  { value: 'pt', label: 'Português', flag: '🇵🇹', description: 'Portuguese' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪', description: 'German' },
  { value: 'fr', label: 'Français', flag: '🇫🇷', description: 'French' },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'standard':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'open-source':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Helper to render stars for a rating (1-10 scaled to 1-5)
function renderStars(rating: number) {
  // If rating is 1-10, scale to 1-5
  const value = Math.round((rating / 10) * 5);
  return (
    <span className="inline-flex items-center ml-1">
      {[1, 2, 3, 4, 5].map(i =>
        i <= value ? (
          <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" fill="currentColor" />
        ) : (
          <StarIcon key={i} className="h-4 w-4 text-gray-300" fill="none" />
        )
      )}
    </span>
  );
}

const ClientPromptCreate = memo<ClientPromptCreateProps>(function ClientPromptCreate() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') ?? "";
  const { toast } = useToast();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('content-creation');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    content: '',
    isPublic: false,
    tags: [],
    tone: 'professional',
    format: 'article',
    wordCount: '',
    targetAudience: '',
    includeExamples: false,
    includeKeywords: false,
    temperature: 0.7,
    language: 'en',
    promptType: 'content-creation',
    llm: 'deepseek-chat',
    systemPrompt: '',
    context: '',
    examples: [],
    constraints: [],
    outputFormat: '',
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    maxTokens: 2000,
    validationRules: [],
    fallbackStrategy: ''
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editableAiResponse, setEditableAiResponse] = useState<string | null>(null);
  const [spinnerMessage, setSpinnerMessage] = useState(getRandomSpinnerMessage());
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState<{
    currentCredits: number;
    requiredCredits: number;
    missingCredits: number;
  }>({ currentCredits: 0, requiredCredits: 0, missingCredits: 0 });
  const [showMedicalWarning, setShowMedicalWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const { balance, isLoading: isCreditLoading } = useCreditBalance();
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [customTone, setCustomTone] = useState('');
  const [showAllModels, setShowAllModels] = useState(false);
  const defaultModels: LLMType[] = ['gpt-3.5-turbo', 'deepseek-chat', 'deepseek-coder-33b'];
  const [step, setStep] = useState<'draft' | 'review'>('draft');
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [ratings, setRatings] = useState<any>(null);
  const [inputTokens, setInputTokens] = useState(0);
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  // 1. Add state for output tokens and original draft for undo
  const [outputTokens, setOutputTokens] = useState<number | null>(null);
  const [originalDraft, setOriginalDraft] = useState<string | null>(null);
  const CREDIT_WARNING_THRESHOLD = 5; // credits
  // 2. Add preset profiles for advanced settings
  const ADVANCED_PRESETS = [
    { label: 'Creative', temperature: 0.9, topP: 1, frequencyPenalty: 0, presencePenalty: 0 },
    { label: 'Balanced', temperature: 0.7, topP: 1, frequencyPenalty: 0, presencePenalty: 0 },
    { label: 'Concise', temperature: 0.3, topP: 0.8, frequencyPenalty: 0.5, presencePenalty: 0.5 },
  ];
  const [selectedPreset, setSelectedPreset] = useState<string>('Balanced');
  const [showCreditWarningModal, setShowCreditWarningModal] = useState(false);
  const [pendingOptimizeEvent, setPendingOptimizeEvent] = useState<React.FormEvent | null>(null);
  const creditWarningRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        try {
          const response = await fetch(`/api/templates/${templateId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch template');
          }
          const template = await response.json();
          setFormData(prev => ({
            ...prev,
            name: template.name,
            description: template.description,
            content: template.content,
            isPublic: template.isPublic,
            tags: template.tags,
            promptType: template.type || 'content-creation',
          }));
          setSelectedTags(template.tags);
        } catch (error) {
          console.error('Error fetching template:', error);
          toast({
            title: 'Error',
            description: 'Failed to load template',
            variant: 'destructive',
          });
        }
      };
      fetchTemplate();
    }
  }, [templateId, toast]);

  // Memoize expensive computations
  const memoizedFormData = useMemo(() => formData, [formData]);
  const memoizedSelectedTags = useMemo(() => selectedTags, [selectedTags]);

  // Use effect for scroll behavior
  useEffect(() => {
    if (aiResponse && aiResponseRef.current) {
      aiResponseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResponse]);

  // Use effect for spinner message
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerMessage(getRandomSpinnerMessage());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Memoize handlers
  const handlePromptTypeChange = useCallback((type: PromptType) => {
    setPromptType(type);
    const selectedType = PROMPT_TYPES.find(t => t.value === type);
    if (selectedType?.examples?.[0]) {
      const example = selectedType.examples[0];
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        content: '',
        tone: example.tone || 'professional',
        format: example.format || 'article',
        isPublic: false,
        tags: [],
        promptType: type,
        systemPrompt: '',
        context: '',
        examples: [],
        constraints: [],
        outputFormat: '',
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxTokens: 2000,
      }));
      setSelectedTags([]);
      
      // Show a toast notification
      toast({
        title: "Prompt Type Selected",
        description: `You've selected ${selectedType.label}. Click on an example below to get started.`,
        duration: 3000,
      });
    }
  }, [toast]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  }, []);

  const addNewTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      setTagError('Tag cannot be empty');
      return;
    }
    
    if (selectedTags.includes(trimmedTag)) {
      setTagError('This tag already exists');
      return;
    }
    
    setSelectedTags(prev => [...prev, trimmedTag]);
    setNewTag('');
    setTagError(null);
  }, [newTag, selectedTags]);

  const handleTest = async () => {
    if (!generatedPrompt) return;
    
    setIsTesting(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatedPrompt,
          temperature: formData.temperature,
          maxTokens: formData.maxTokens,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test prompt');
      }

      setTestResult(data.testResult);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to test prompt');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test prompt',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handler for top up
  const handleTopUpCredits = () => {
    setShowCreditWarningModal(false);
    setTimeout(() => setShowCreditsDialog(true), 100); // Open the credit purchase modal
  };

  // Handler for continue
  const handleContinueAnyway = () => {
    setShowCreditWarningModal(false);
    if (pendingOptimizeEvent && creditWarningRef.current) {
      creditWarningRef.current();
      setPendingOptimizeEvent(null);
    }
  };

  // Step 1: User submits draft, call AI to optimize
  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estimatedCredits > CREDIT_WARNING_THRESHOLD) {
      setPendingOptimizeEvent(e);
      creditWarningRef.current = async () => {
        setIsOptimizing(true);
        setError(null);
        setOriginalDraft(formData.content);
        try {
          const res = await fetch('/api/prompts/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: formData.content,
              temperature: formData.temperature,
              topP: formData.topP,
              frequencyPenalty: formData.frequencyPenalty,
              presencePenalty: formData.presencePenalty,
              maxTokens: formData.maxTokens,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.optimizedContent) {
            setError(data.error || 'Failed to optimize prompt');
            setIsOptimizing(false);
            return;
          }
          setAiContent(data.optimizedContent);
          setRatings(data.ratings || null);
          setShowReviewDialog(true);
          setStep('review');
          if (typeof data.outputTokens === 'number') setOutputTokens(data.outputTokens);
          else setOutputTokens(typeof formData.maxTokens === 'number' ? formData.maxTokens : 0);
        } catch (err) {
          setError('Failed to optimize prompt');
        } finally {
          setIsOptimizing(false);
        }
      };
      setShowCreditWarningModal(true);
      return;
    }
    setIsOptimizing(true);
    setError(null);
    setOriginalDraft(formData.content);
    try {
      const res = await fetch('/api/prompts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formData.content,
          temperature: formData.temperature,
          topP: formData.topP,
          frequencyPenalty: formData.frequencyPenalty,
          presencePenalty: formData.presencePenalty,
          maxTokens: formData.maxTokens,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.optimizedContent) {
        setError(data.error || 'Failed to optimize prompt');
        setIsOptimizing(false);
        return;
      }
      setAiContent(data.optimizedContent);
      setRatings(data.ratings || null);
      setShowReviewDialog(true);
      setStep('review');
      if (typeof data.outputTokens === 'number') setOutputTokens(data.outputTokens);
      else setOutputTokens(typeof formData.maxTokens === 'number' ? formData.maxTokens : 0);
    } catch (err) {
      setError('Failed to optimize prompt');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Step 2: User reviews AI-enhanced prompt, can save or cancel
  const handleSave = async () => {
    if (!aiContent) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: aiContent,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create prompt');
        setIsSubmitting(false);
        return;
      }
      toast({
        title: 'Prompt Created',
        description: 'Successfully created prompt.',
        duration: 5000,
      });
      router.push(`/prompts/${data.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prompt';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStep('draft');
    setAiContent(null);
  };

  const handleExampleClick = (example: ExamplePrompt) => {
    setFormData(prev => ({
      ...prev,
      name: example.name,
      description: example.description,
      content: example.content,
      promptType: example.promptType,
      systemPrompt: example.systemPrompt || '',
      context: example.context || '',
      examples: example.examples || [],
      constraints: example.constraints || [],
      outputFormat: example.outputFormat || '',
      temperature: example.temperature || 0.7,
      maxTokens: example.maxTokens || 2000,
      topP: example.topP || 1,
      frequencyPenalty: example.frequencyPenalty || 0,
      presencePenalty: example.presencePenalty || 0,
      tone: example.tone || 'professional',
      format: example.format || 'article',
      style: example.style || '',
      resolution: example.resolution || '',
      palette: example.palette || '',
      duration: example.duration || '',
      genre: example.genre || '',
      mood: example.mood || '',
      length: example.length || '',
      instruments: example.instruments || '',
      validationRules: example.validationRules || [],
    }));
    setSelectedTags(example.tags || []);

    // Show a toast notification
    toast({
      title: "Example Loaded",
      description: "The example has been loaded. You can now customize it to your needs.",
      duration: 3000,
    });
  };

  const MedicalDisclaimer = () => (
    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <div className="space-y-2">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Important Notice</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Medical prompts are provided for educational and reference purposes only. They should
            not be used as a substitute for professional medical advice, diagnosis, or treatment.
            Always consult with qualified healthcare professionals for medical decisions.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
            <li>Verify all medical information with qualified professionals</li>
            <li>Ensure compliance with local medical regulations</li>
            <li>Maintain patient confidentiality and HIPAA compliance</li>
            <li>Use appropriate disclaimers in all medical content</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Add effect to check credit balance
  useEffect(() => {
    if (balance) {
      const totalCredits = balance.monthlyCredits + balance.purchasedCredits;
      const monthlyTotal = balance.usage.monthlyTotal;
      const usagePercentage = balance.usage.monthlyPercentage;
      
      // Show warning when usage is above 80%
      setShowCreditWarning(usagePercentage >= 80);
    }
  }, [balance]);

  const TONE_OPTIONS = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'technical', label: 'Technical', description: 'Precise and detailed' },
    { value: 'creative', label: 'Creative', description: 'Imaginative and expressive' },
    { value: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
    { value: 'educational', label: 'Educational', description: 'Informative and instructive' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted and entertaining' },
    { value: 'authoritative', label: 'Authoritative', description: 'Confident and commanding' },
    { value: 'empathetic', label: 'Empathetic', description: 'Understanding and supportive' },
    { value: 'custom', label: 'Custom', description: 'Specify your own tone' },
  ];

  useEffect(() => {
    // Count tokens in the prompt content
    const tokens = encode(formData.content || '').length;
    setInputTokens(tokens);
    // Estimate credits
    const model = AVAILABLE_LLMS.find(llm => llm.value === formData.llm);
    const inputRate = model?.creditCost.input ?? 0;
    const outputRate = model?.creditCost.output ?? 0;
    const outputTokens = formData.maxTokens ?? 0;
    const credits = (tokens / 1000) * inputRate + (outputTokens / 1000) * outputRate;
    setEstimatedCredits(credits);
  }, [formData.content, formData.llm, formData.maxTokens]);

  // Place this before the return statement, inside the component:
  const selectedModel = AVAILABLE_LLMS.find(llm => llm.value === formData.llm);
  const inputCreditRate = selectedModel?.creditCost.input ?? 0;
  const outputCreditRate = selectedModel?.creditCost.output ?? 0;
  const outputTokensSafe = outputTokens ?? formData.maxTokens ?? 0;
  const estimatedReviewCredits = ((inputTokens / 1000) * inputCreditRate + (outputTokensSafe / 1000) * outputCreditRate).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-pink-50/80 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20">
      <NavBar user={clerkUser ? {
        name: clerkUser.fullName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        imageUrl: clerkUser.imageUrl
      } : undefined} />
      {showMedicalWarning && <FloatingWarningBar onClose={() => setShowMedicalWarning(false)} />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Remove Credit Usage Display */}
        <CreditUsageNotification />
        
        {/* Hero/Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-transparent font-inter">
            Create Your Prompt
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">
            Design your prompt to get the exact results you want
          </p>
        </div>
        {/* Responsive Grid: Main Content (left) + Sticky Sidebar (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Quick Start, Form, Tips) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Quick Start Card */}
            <Card className="rounded-2xl border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Quick Start
                </CardTitle>
                <CardDescription>
                  Choose a template or start from scratch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm hover:scale-105 transition"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        name: '',
                        description: '',
                        content: '',
                        tags: [],
                        promptType: 'custom'
                      }));
                    }}
                  >
                    <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                      <PenTool className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Start from Scratch</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create a custom prompt from the ground up
                      </p>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm hover:scale-105 transition"
                    onClick={() => {
                      router.push('/prompts/templates');
                    }}
                  >
                    <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium">Browse Templates</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Explore our collection of professional templates
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Main Form */}
            {step === 'draft' && (
              <form onSubmit={handleOptimize} className="space-y-6">
                <Card className="rounded-2xl border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {showCreditWarning && (
                        <Alert variant="default" className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Low Credit Balance</AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            You are approaching your credit limit. Consider upgrading your plan or purchasing additional credits to continue creating prompts.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter prompt name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter prompt description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={formData.language}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGE_OPTIONS.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{lang.flag}</span>
                                    <div className="flex flex-col">
                                      <span>{lang.label}</span>
                                      <span className="text-xs text-muted-foreground">{lang.description}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Select the language for your prompt
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tone">Tone</Label>
                          <div className="flex gap-2">
                            <Select
                              value={formData.tone}
                              onValueChange={(value) => {
                                setFormData(prev => ({ ...prev, tone: value }));
                                if (value !== 'custom') {
                                  setCustomTone('');
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                              <SelectContent>
                                {TONE_OPTIONS.map((tone) => (
                                  <SelectItem key={tone.value} value={tone.value}>
                                    <div className="flex flex-col">
                                      <span>{tone.label}</span>
                                      <span className="text-xs text-muted-foreground">{tone.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formData.tone === 'custom' && (
                              <Input
                                value={customTone}
                                onChange={(e) => {
                                  setCustomTone(e.target.value);
                                  setFormData(prev => ({ ...prev, tone: e.target.value }));
                                }}
                                placeholder="Enter custom tone"
                                className="flex-1"
                              />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            The tone helps set the style and mood of the generated content
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="persona">Persona</Label>
                        <Input
                          id="persona"
                          value={formData.persona ?? ''}
                          onChange={e => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                          placeholder="e.g., Act as a helpful assistant, Act as a senior developer"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Prompt Template</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span tabIndex={0}>
                                <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 bg-gradient-to-r from-purple-600 to-pink-600 hover:text-purple-500" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Create your prompt template using [variables] in brackets</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          value={formData.content}
                          onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="e.g., Write a blog post about [topic] for [audience]"
                          required
                          className="min-h-[120px] font-mono"
                        />
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Input tokens: <span className="font-semibold">{inputTokens}</span></span>
                          <span>Estimated output tokens: <span className="font-semibold">{formData.maxTokens}</span></span>
                          <span>Estimated credits: <span className="font-semibold">{estimatedCredits.toFixed(2)}</span></span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    tags: prev.tags.filter(t => t !== tag),
                                  }));
                                }}
                                className="ml-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTag ?? ""}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addNewTag();
                              }
                            }}
                            placeholder="Add a tag"
                            className="flex-1"
                          />
                          <Button type="button" onClick={addNewTag} variant="outline">
                            Add
                          </Button>
                        </div>
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="maxTokens">Token Limit</Label>
                        <Input
                          id="maxTokens"
                          type="number"
                          min={1}
                          max={4096}
                          value={formData.maxTokens ?? 1024}
                          onChange={e => setFormData(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
                          placeholder="e.g., 1024"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPublic"
                          checked={formData.isPublic}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, isPublic: checked }))}
                          className="data-[state=checked]:bg-purple-500"
                        />
                        <Label
                          htmlFor="isPublic"
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                        >
                          {formData.isPublic ? (
                            <>
                              <Globe className="h-4 w-4" /> Make prompt public
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" /> Keep prompt private
                            </>
                          )}
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="llm">Language Model</Label>
                        <Alert variant="default" className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <AlertTitle className="text-blue-800 dark:text-blue-300">More Models Coming Soon</AlertTitle>
                          <AlertDescription className="text-blue-700 dark:text-blue-400">
                            We're continuously adding new models to provide you with more options. Stay tuned for updates!
                          </AlertDescription>
                        </Alert>
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="font-medium">Credit Cost Legend</h4>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent 
                              side="right" 
                              className="w-96 p-4 bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800 shadow-lg"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800 pb-2">
                                  <h5 className="font-semibold text-purple-800 dark:text-purple-300">Credit Costs</h5>
                                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                                    Per 1,000 tokens
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                        <span className="text-muted-foreground">Input:</span>
                                        <span className="font-medium">
                                          {AVAILABLE_LLMS.find(llm => llm.value === formData.llm)?.creditCost.input ?? 0}
                                        </span>
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">For prompt tokens</p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                                        <span className="text-muted-foreground">Output:</span>
                                        <span className="font-medium">
                                          {AVAILABLE_LLMS.find(llm => llm.value === formData.llm)?.creditCost.output ?? 0}
                                        </span>
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">For response tokens</p>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-purple-100 dark:border-purple-800">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-purple-500" />
                                    <h6 className="font-medium text-purple-800 dark:text-purple-300">Example Calculation</h6>
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                    <p className="text-sm text-purple-700 dark:text-purple-400">
                                      A 500-token prompt with 200-token response would cost{' '}
                                      <span className="font-semibold">
                                        {(
                                          (AVAILABLE_LLMS.find(llm => llm.value === formData.llm)?.creditCost.input ?? 0) * 0.5 +
                                          (AVAILABLE_LLMS.find(llm => llm.value === formData.llm)?.creditCost.output ?? 0) * 0.2
                                        ).toFixed(1)}{' '}
                                        credits
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <ScrollArea className="h-[400px] rounded-md border p-4">
                          <RadioGroup
                            value={formData.llm}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, llm: value as LLMType }))}
                            className="space-y-4"
                          >
                            {AVAILABLE_LLMS
                              .filter(llm => showAllModels || defaultModels.includes(llm.value))
                              .map((llm) => (
                              <div
                                key={llm.value}
                                className={cn(
                                  "flex items-start space-x-4 rounded-lg border p-4 transition-colors",
                                  formData.llm === llm.value
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-accent/50"
                                )}
                              >
                                <RadioGroupItem
                                  value={llm.value}
                                  id={llm.value}
                                  className="mt-1"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <Label
                                      htmlFor={llm.value}
                                      className="text-base font-semibold"
                                    >
                                      {llm.label}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className={getCategoryColor(llm.category)}
                                      >
                                        {llm.provider}
                                      </Badge>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            <span className="text-muted-foreground">Cost:</span>
                                            <span className="font-medium">
                                              {llm.creditCost.input} → {llm.creditCost.output}
                                            </span>
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[300px]">
                                          <div className="space-y-2">
                                            <p className="font-medium">Credit Cost per 1,000 tokens:</p>
                                            <div className="text-sm space-y-1">
                                              <p>• Input: {llm.creditCost.input} credits</p>
                                              <p>• Output: {llm.creditCost.output} credits</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                              Example: A 500-token prompt with 200-token response would cost {(llm.creditCost.input * 0.5 + llm.creditCost.output * 0.2).toFixed(1)} credits
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {llm.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {llm.capabilities.map((capability) => (
                                      <Badge
                                        key={capability}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {capability}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                          {!showAllModels && (
                            <div className="mt-4 flex justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAllModels(true)}
                                className="flex items-center gap-2"
                              >
                                <ChevronDown className="h-4 w-4" />
                                Show More Models
                              </Button>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 border-purple-200 dark:border-purple-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isOptimizing}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="h-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4" />
                        Optimize with AI
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X className="h-5 w-5" />
                      <p className="font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            )}
            {/* Review Dialog for AI-optimized prompt */}
            {showReviewDialog && (
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogContent className="sm:max-w-[800px]">
                  <DialogHeader>
                    <DialogTitle>AI-Optimized Prompt</DialogTitle>
                    <DialogDescription>
                      Review and edit the optimized prompt before saving.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Ratings Display */}
                  {ratings && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">AI Ratings</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Clarity:</span> {ratings.clarity} {renderStars(ratings.clarity)}
                        </div>
                        <div>
                          <span className="font-medium">Effectiveness:</span> {ratings.effectiveness} {renderStars(ratings.effectiveness)}
                        </div>
                        <div>
                          <span className="font-medium">Creativity:</span> {ratings.creativity} {renderStars(ratings.creativity)}
                        </div>
                        <div>
                          <span className="font-medium">Conciseness:</span> {ratings.conciseness} {renderStars(ratings.conciseness)}
                        </div>
                        <div>
                          <span className="font-medium">Best Practices:</span> {ratings.best_practices} {renderStars(ratings.best_practices)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 mb-2 text-xs text-muted-foreground">
                    <span>Input tokens: <span className="font-semibold">{inputTokens}</span></span>
                    <span>Output tokens: <span className="font-semibold">{outputTokens ?? formData.maxTokens}</span></span>
                    <span>Estimated credits: <span className="font-semibold">{estimatedReviewCredits}</span></span>
                    <span>Remaining credits: <span className="font-semibold">{((balance?.monthlyCredits ?? 0) + (balance?.purchasedCredits ?? 0)).toLocaleString()}</span></span>
                  </div>
                  <Textarea
                    value={aiContent || ''}
                    onChange={e => setAiContent(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                      {isSubmitting ? 'Saving...' : 'Save Prompt'}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowReviewDialog(false); setStep('draft'); setAiContent(null); setRatings(null); }}>Cancel</Button>
                    {/* 6. Undo button */}
                    {originalDraft && (
                      <Button variant="secondary" onClick={() => setAiContent(originalDraft)}>
                        Undo to Draft
                      </Button>
                    )}
                  </div>
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-4">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <X className="h-5 w-5" />
                        <p className="font-medium">{error}</p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
          {/* Sticky Sidebar: Quick Tips + Advanced AI Settings */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-16 h-fit flex flex-col gap-6">
            {/* Quick Tips Card */}
            <Card className="rounded-2xl border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-purple-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
               <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Use [brackets] for variables
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Be specific in your instructions
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Include examples when possible
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Start with a clear goal
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Specify the format or structure you want
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Set the tone (formal, casual, technical, etc.)
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Limit the length if needed
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Provide context or background information
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Ask for step-by-step reasoning for complex tasks
</li>
<li className="flex items-center gap-2">
  <Check className="h-4 w-4 text-green-500" />
  Iterate and refine your prompt for best results
</li>
</ul>
              </CardContent>
            </Card>
            {/* Advanced AI Settings Card */}
            <Card className="rounded-2xl border-2 border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-purple-500" />
                  Advanced AI Settings
                </CardTitle>
                <CardDescription>Fine-tune the AI's response generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="mb-2">
                  <Label>Preset</Label>
                  <Select value={selectedPreset} onValueChange={preset => {
                    setSelectedPreset(preset);
                    const found = ADVANCED_PRESETS.find(p => p.label === preset);
                    if (found) {
                      setFormData(prev => ({
                        ...prev,
                        temperature: found.temperature,
                        topP: found.topP,
                        frequencyPenalty: found.frequencyPenalty,
                        presencePenalty: found.presencePenalty,
                      }));
                    }
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADVANCED_PRESETS.map(preset => (
                        <SelectItem key={preset.label} value={preset.label}>{preset.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-pointer"><HelpCircle className="h-4 w-4 text-gray-400" /></span></TooltipTrigger><TooltipContent>Controls randomness: Lower values are more focused, higher values more creative.</TooltipContent></Tooltip>
                    <span className="text-sm text-muted-foreground">{formData.temperature ?? 0.7}</span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[formData.temperature ?? 0.7]}
                    onValueChange={([value]: number[]) => setFormData(prev => ({ ...prev, temperature: value }))}
                    className="w-full slider-purple"
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls randomness: Lower values are more focused, higher values more creative
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="topP">Top P</Label>
                    <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-pointer"><HelpCircle className="h-4 w-4 text-gray-400" /></span></TooltipTrigger><TooltipContent>Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered.</TooltipContent></Tooltip>
                    <span className="text-sm text-muted-foreground">{formData.topP ?? 1}</span>
                  </div>
                  <Slider
                    id="topP"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[formData.topP ?? 1]}
                    onValueChange={([value]: number[]) => setFormData(prev => ({ ...prev, topP: value }))}
                    className="w-full slider-purple"
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
                    <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-pointer"><HelpCircle className="h-4 w-4 text-gray-400" /></span></TooltipTrigger><TooltipContent>Reduces repetition of the same line verbatim.</TooltipContent></Tooltip>
                    <span className="text-sm text-muted-foreground">{formData.frequencyPenalty ?? 0}</span>
                  </div>
                  <Slider
                    id="frequencyPenalty"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={[formData.frequencyPenalty ?? 0]}
                    onValueChange={([value]: number[]) => setFormData(prev => ({ ...prev, frequencyPenalty: value }))}
                    className="w-full slider-purple"
                  />
                  <p className="text-sm text-muted-foreground">
                    Reduces repetition of the same line verbatim
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="presencePenalty">Presence Penalty</Label>
                    <Tooltip><TooltipTrigger asChild><span className="ml-1 cursor-pointer"><HelpCircle className="h-4 w-4 text-gray-400" /></span></TooltipTrigger><TooltipContent>Reduces repetition of similar topics.</TooltipContent></Tooltip>
                    <span className="text-sm text-muted-foreground">{formData.presencePenalty ?? 0}</span>
                  </div>
                  <Slider
                    id="presencePenalty"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={[formData.presencePenalty ?? 0]}
                    onValueChange={([value]: number[]) => setFormData(prev => ({ ...prev, presencePenalty: value }))}
                    className="w-full slider-purple"
                  />
                  <p className="text-sm text-muted-foreground">
                    Reduces repetition of similar topics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {testResult && (
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Test Result</DialogTitle>
              <DialogDescription>
                {testResult ? 'AI Response' : 'Test Prompt'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {testResult ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      AI Response
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (testResult) {
                          navigator.clipboard.writeText(testResult);
                          toast({
                            title: 'Copied!',
                            description: 'AI response copied to clipboard',
                          });
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={testResult ?? ''}
                      readOnly
                      className="min-h-[200px] font-mono text-sm bg-muted border"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                      Test Prompt
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (generatedPrompt) {
                          navigator.clipboard.writeText(generatedPrompt);
                          toast({
                            title: 'Copied!',
                            description: 'Prompt copied to clipboard',
                          });
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={generatedPrompt ?? ''}
                      readOnly
                      className="min-h-[200px] font-mono text-sm bg-muted border"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(false)}
              >
                Close
              </Button>
              <Button
                onClick={handleTest}
                disabled={isTesting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Prompt
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Prompt
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Add the credit warning modal JSX near the root of the component: */}
      <Dialog open={showCreditWarningModal} onOpenChange={setShowCreditWarningModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>High Credit Usage</DialogTitle>
            <DialogDescription>
              This operation will use approximately <span className="font-semibold">{estimatedCredits.toFixed(2)} credits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 text-sm text-muted-foreground">
            {((balance?.monthlyCredits ?? 0) + (balance?.purchasedCredits ?? 0)) < estimatedCredits ? (
              <span className="text-red-600 font-medium">You do not have enough credits to complete this operation.</span>
            ) : (
              <span>Are you sure you want to continue?</span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleTopUpCredits}>Top Up Credits</Button>
            <Button onClick={handleContinueAnyway} disabled={((balance?.monthlyCredits ?? 0) + (balance?.purchasedCredits ?? 0)) < estimatedCredits} className="bg-green-600 hover:bg-green-700 text-white">Continue Anyway</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export { PROMPT_TYPES };
export default ClientPromptCreate;
