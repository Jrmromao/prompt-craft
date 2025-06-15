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
} from 'lucide-react';
import { AIService } from '@/lib/services/aiService';
import type { PromptPayload, PromptType } from '@/types/ai';
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
    wordCount: '500',
    targetAudience: 'general',
    includeExamples: true,
    includeKeywords: true,
    temperature: 0.7,
    language: 'en',
    promptType: 'content-creation',
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
    fallbackStrategy: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const estimatedCost = 1; // Basic cost for prompt creation, adjust based on your pricing model

    try {
      // Check credit balance before proceeding
      if (balance) {
        const totalCredits = balance.monthlyCredits + balance.purchasedCredits;
        
        if (totalCredits < estimatedCost) {
          setShowCreditsDialog(true);
          setCreditsInfo({
            currentCredits: totalCredits,
            requiredCredits: estimatedCost,
            missingCredits: estimatedCost - totalCredits
          });
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          content: formData.content,
          isPublic: formData.isPublic,
          tags: formData.tags,
          promptType: formData.promptType,
          tone: formData.tone,
          format: formData.format,
          wordCount: formData.wordCount,
          targetAudience: formData.targetAudience,
          includeExamples: formData.includeExamples,
          includeKeywords: formData.includeKeywords,
          temperature: formData.temperature,
          language: formData.language,
          persona: formData.persona,
          includeImageDescription: formData.includeImageDescription,
          systemPrompt: formData.systemPrompt,
          context: formData.context,
          examples: formData.examples,
          constraints: formData.constraints,
          outputFormat: formData.outputFormat,
          topP: formData.topP,
          frequencyPenalty: formData.frequencyPenalty,
          presencePenalty: formData.presencePenalty,
          maxTokens: formData.maxTokens,
          validationRules: formData.validationRules,
          fallbackStrategy: formData.fallbackStrategy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }

      const prompt = await response.json();

      // If this prompt was created from a template, increment its usage count
      if (templateId) {
        try {
          await fetch(`/api/templates/${templateId}/usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Failed to increment template usage:', error);
          // Don't throw here, as the prompt was created successfully
        }
      }

      // Show success toast with credit usage info
      toast({
        title: 'Prompt Created',
        description: `Successfully created prompt. ${estimatedCost} credits used.`,
        duration: 5000,
      });

      router.push(`/prompts/${prompt.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create prompt',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: generatedPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save prompt');
      }

      toast({
        title: 'Success',
        description: 'Prompt saved successfully',
      });
      router.push('/prompts');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save prompt');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save prompt',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-inter">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger className="w-[200px]">
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
                          <SelectTrigger className="w-[200px]">
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
                              <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Prompt
                    </>
                  )}
                </Button>
              </div>
            </form>
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Temperature</Label>
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
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <X className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export { PROMPT_TYPES };
export default ClientPromptCreate;
