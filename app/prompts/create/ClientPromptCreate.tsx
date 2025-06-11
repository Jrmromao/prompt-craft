'use client';
import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  type LucideIcon,
} from 'lucide-react';
import { AIService } from '@/lib/services/aiService';
import type { PromptPayload, PromptType } from '@/types/ai';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NavBarUser } from '@/components/layout/NavBar';
import { NavBar } from '@/components/layout/NavBar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { InsufficientCreditsDialog } from '@/components/prompts/InsufficientCreditsDialog';
import Playground from '../../../components/Playground';
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

const PROMPT_TYPES: {
  value: PromptType;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
  examples: {
    name: string;
    description: string;
    content: string;
    tags: string[];
    tone?: string;
    format?: string;
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
        name: 'Blog Post Generator',
        description: 'Generate engaging blog posts with SEO optimization',
        content: 'Write a blog post about [topic] that is [tone] and targets [audience]. Include SEO keywords and a clear structure.',
        tags: ['blog', 'content', 'seo', 'writing'],
        tone: 'professional',
        format: 'article'
      },
      {
        name: 'Social Media Post',
        description: 'Create viral social media content',
        content: 'Create a [platform] post about [topic] that will engage [audience]. Include hashtags and a call to action.',
        tags: ['social-media', 'marketing', 'engagement'],
        tone: 'casual',
        format: 'social'
      },
      {
        name: 'News Article',
        description: 'Generate news article content',
        content: 'Write a news article about [event] for [publication]. Include key facts, quotes, and context.',
        tags: ['news', 'journalism', 'writing', 'content'],
        tone: 'objective',
        format: 'news'
      },
      {
        name: 'Product Description',
        description: 'Create compelling product descriptions',
        content: 'Write a product description for [product] highlighting [features]. Include benefits and specifications.',
        tags: ['marketing', 'product', 'content', 'sales'],
        tone: 'persuasive',
        format: 'product'
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
        name: 'Function Generator',
        description: 'Generate reusable code functions',
        content: 'Create a [language] function that [purpose] with [requirements]. Include error handling and documentation.',
        tags: ['code', 'development', 'programming', 'function'],
        tone: 'technical',
        format: 'code'
      },
      {
        name: 'API Integration',
        description: 'Generate API integration code',
        content: 'Write code to integrate [API] with [framework] for [purpose]. Include authentication and error handling.',
        tags: ['api', 'integration', 'backend', 'code'],
        tone: 'technical',
        format: 'code'
      },
      {
        name: 'Database Query',
        description: 'Generate database queries',
        content: 'Create a [database] query to [operation] with [conditions]. Include proper indexing and optimization.',
        tags: ['database', 'query', 'sql', 'code'],
        tone: 'technical',
        format: 'code'
      },
      {
        name: 'Test Case Generator',
        description: 'Generate unit test cases',
        content: 'Write test cases for [function/component] covering [scenarios]. Include edge cases and error conditions.',
        tags: ['testing', 'unit-test', 'code', 'quality'],
        tone: 'technical',
        format: 'code'
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
        name: 'Data Visualization',
        description: 'Generate data visualization code',
        content: 'Create a visualization for [dataset] showing [insights]. Use [chart type] and include annotations.',
        tags: ['data', 'visualization', 'analysis', 'charts'],
        tone: 'analytical',
        format: 'report'
      },
      {
        name: 'Statistical Analysis',
        description: 'Generate statistical analysis code',
        content: 'Analyze [dataset] to find [insights]. Include [statistical methods] and present findings clearly.',
        tags: ['statistics', 'analysis', 'data', 'research'],
        tone: 'analytical',
        format: 'report'
      },
      {
        name: 'Predictive Model',
        description: 'Generate predictive modeling code',
        content: 'Create a predictive model for [target] using [features]. Include model evaluation and validation.',
        tags: ['machine-learning', 'prediction', 'analysis', 'data'],
        tone: 'analytical',
        format: 'report'
      },
      {
        name: 'Data Cleaning',
        description: 'Generate data cleaning scripts',
        content: 'Create a script to clean [dataset] by handling [issues]. Include data validation and transformation.',
        tags: ['data-cleaning', 'preprocessing', 'analysis', 'code'],
        tone: 'technical',
        format: 'code'
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
        name: 'Story Generator',
        description: 'Generate creative story ideas',
        content: 'Write a [genre] story about [theme] with [character traits]. Include plot twists and character development.',
        tags: ['story', 'creative', 'writing', 'fiction'],
        tone: 'creative',
        format: 'story'
      },
      {
        name: 'Poem Generator',
        description: 'Generate poetry prompts',
        content: 'Create a [poem type] about [theme] using [style]. Include [literary devices] and emotional depth.',
        tags: ['poetry', 'creative', 'writing', 'literature'],
        tone: 'artistic',
        format: 'poem'
      },
      {
        name: 'Character Development',
        description: 'Generate character profiles',
        content: 'Create a character profile for [character type] with [background]. Include personality and motivations.',
        tags: ['character', 'creative', 'writing', 'development'],
        tone: 'creative',
        format: 'profile'
      },
      {
        name: 'Dialogue Generator',
        description: 'Generate realistic dialogue',
        content: 'Write a dialogue between [characters] about [topic]. Include subtext and emotional undertones.',
        tags: ['dialogue', 'creative', 'writing', 'conversation'],
        tone: 'natural',
        format: 'dialogue'
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
        name: 'Business Plan',
        description: 'Generate business plan sections',
        content: 'Create a [section] for a business plan about [business type]. Include market analysis and financial projections.',
        tags: ['business', 'planning', 'strategy', 'analysis'],
        tone: 'professional',
        format: 'document'
      },
      {
        name: 'Market Analysis',
        description: 'Generate market analysis reports',
        content: 'Analyze the market for [product/service] in [market]. Include competitors, trends, and opportunities.',
        tags: ['market', 'analysis', 'business', 'research'],
        tone: 'analytical',
        format: 'report'
      },
      {
        name: 'Financial Report',
        description: 'Generate financial analysis',
        content: 'Create a financial analysis for [company/project] covering [period]. Include key metrics and insights.',
        tags: ['finance', 'analysis', 'business', 'report'],
        tone: 'professional',
        format: 'report'
      },
      {
        name: 'Business Proposal',
        description: 'Generate business proposals',
        content: 'Write a business proposal for [project] targeting [client]. Include value proposition and timeline.',
        tags: ['proposal', 'business', 'sales', 'document'],
        tone: 'persuasive',
        format: 'proposal'
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
        name: 'Lesson Plan',
        description: 'Generate lesson plans',
        content: 'Create a lesson plan for [subject] about [topic] for [grade level]. Include objectives and activities.',
        tags: ['education', 'teaching', 'lesson-plan', 'learning'],
        tone: 'educational',
        format: 'lesson'
      },
      {
        name: 'Study Guide',
        description: 'Generate study guides',
        content: 'Create a study guide for [subject] covering [topics]. Include key concepts and practice questions.',
        tags: ['education', 'study', 'learning', 'guide'],
        tone: 'educational',
        format: 'guide'
      },
      {
        name: 'Quiz Generator',
        description: 'Generate educational quizzes',
        content: 'Create a quiz for [subject] testing [topics]. Include various question types and difficulty levels.',
        tags: ['education', 'quiz', 'assessment', 'learning'],
        tone: 'educational',
        format: 'quiz'
      },
      {
        name: 'Learning Activity',
        description: 'Generate interactive learning activities',
        content: 'Design a learning activity for [subject] about [topic]. Include materials and instructions.',
        tags: ['education', 'activity', 'interactive', 'learning'],
        tone: 'engaging',
        format: 'activity'
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
        name: 'API Documentation',
        description: 'Generate API documentation',
        content: 'Document the [API endpoint] with [parameters]. Include examples and error responses.',
        tags: ['api', 'documentation', 'technical', 'guide'],
        tone: 'technical',
        format: 'documentation'
      },
      {
        name: 'Technical Guide',
        description: 'Generate technical guides',
        content: 'Create a guide for [technology] explaining [concept]. Include setup steps and best practices.',
        tags: ['technical', 'guide', 'documentation', 'tutorial'],
        tone: 'technical',
        format: 'guide'
      },
      {
        name: 'System Architecture',
        description: 'Generate system architecture documentation',
        content: 'Document the architecture of [system] including [components]. Include diagrams and explanations.',
        tags: ['architecture', 'technical', 'documentation', 'design'],
        tone: 'technical',
        format: 'documentation'
      },
      {
        name: 'Troubleshooting Guide',
        description: 'Generate troubleshooting guides',
        content: 'Create a troubleshooting guide for [issue] in [system]. Include common problems and solutions.',
        tags: ['troubleshooting', 'technical', 'guide', 'support'],
        tone: 'technical',
        format: 'guide'
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
        name: 'Research Paper',
        description: 'Generate research paper sections',
        content: 'Write the [section] of a research paper about [topic]. Include methodology and findings.',
        tags: ['research', 'academic', 'paper', 'analysis'],
        tone: 'academic',
        format: 'paper'
      },
      {
        name: 'Literature Review',
        description: 'Generate literature review prompts',
        content: 'Review the literature on [topic] focusing on [aspects]. Include key findings and gaps.',
        tags: ['research', 'literature', 'review', 'academic'],
        tone: 'academic',
        format: 'review'
      },
      {
        name: 'Research Proposal',
        description: 'Generate research proposals',
        content: 'Write a research proposal for [study] investigating [topic]. Include methodology and timeline.',
        tags: ['research', 'proposal', 'academic', 'planning'],
        tone: 'academic',
        format: 'proposal'
      },
      {
        name: 'Data Analysis Report',
        description: 'Generate research data analysis',
        content: 'Analyze the research data from [study] focusing on [variables]. Include statistical methods and results.',
        tags: ['research', 'analysis', 'data', 'academic'],
        tone: 'academic',
        format: 'report'
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
        name: 'Custom Template',
        description: 'Create a custom prompt template',
        content: 'Create a [type] about [topic] with [specific requirements]. Include [custom elements].',
        tags: ['custom', 'template', 'flexible', 'specialized'],
        tone: 'customizable',
        format: 'custom'
      },
      {
        name: 'Specialized Format',
        description: 'Create a specialized format prompt',
        content: 'Generate content in [specialized format] for [purpose] with [requirements].',
        tags: ['custom', 'specialized', 'format', 'template'],
        tone: 'customizable',
        format: 'custom'
      },
      {
        name: 'Industry-Specific',
        description: 'Create industry-specific prompts',
        content: 'Generate [industry] content about [topic] following [industry standards].',
        tags: ['custom', 'industry', 'specialized', 'template'],
        tone: 'professional',
        format: 'custom'
      },
      {
        name: 'Multi-Purpose',
        description: 'Create multi-purpose prompts',
        content: 'Create a versatile prompt for [purposes] that can be adapted for [use cases].',
        tags: ['custom', 'versatile', 'multi-purpose', 'template'],
        tone: 'flexible',
        format: 'custom'
      }
    ]
  }
];

const COMMON_TAGS = [
  // Content Creation
  'blog', 'content', 'seo', 'writing', 'social-media', 'marketing', 'engagement',
  // Code Generation
  'code', 'development', 'programming', 'function', 'api', 'integration', 'backend',
  // Data Analysis
  'data', 'visualization', 'analysis', 'charts', 'statistics', 'research',
  // Creative Writing
  'story', 'creative', 'fiction', 'poetry', 'literature',
  // Business
  'business', 'planning', 'strategy', 'market', 'research',
  // Education
  'education', 'teaching', 'lesson-plan', 'learning', 'study', 'guide',
  // Technical
  'technical', 'documentation', 'tutorial', 'api', 'guide',
  // Research
  'research', 'academic', 'paper', 'literature', 'review',
  // Custom
  'custom', 'template', 'flexible', 'specialized'
];

interface ExamplePrompt {
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
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    name: 'Blog Post Template',
    description: 'A template for creating engaging blog posts',
    content: 'Write a blog post about [topic] that is [tone] and targets [audience].',
    tags: ['blog', 'content', 'writing'],
    tone: 'casual',
    format: 'social-media',
    promptType: 'content-creation',
  },
  {
    name: 'Story Prompt Template',
    description: 'A template for creative story writing',
    content: 'Write a story about [topic] with [genre] elements and [mood] tone.',
    tags: ['story', 'creative', 'writing'],
    tone: 'creative',
    format: 'story',
    promptType: 'creative-writing',
  },
  {
    name: 'Business Analysis Prompt',
    description: 'A template for business analysis reports',
    content: 'Analyze the business case for [topic] considering [factors].',
    tags: ['business', 'analysis', 'report'],
    tone: 'professional',
    format: 'article',
    promptType: 'business',
  },
  {
    name: 'Code Generation Template',
    description: 'A template for generating code snippets',
    content: 'Generate a [language] function that [purpose] with [requirements].',
    tags: ['code', 'development', 'programming'],
    tone: 'technical',
    format: 'code',
    promptType: 'code-generation',
  },
  {
    name: 'Data Analysis Template',
    description: 'A template for data analysis tasks',
    content: 'Analyze the dataset [description] to find [insights].',
    tags: ['data', 'analysis', 'visualization'],
    tone: 'analytical',
    format: 'report',
    promptType: 'data-analysis',
  },
  {
    name: 'Educational Content Template',
    description: 'A template for creating educational materials',
    content: 'Create an educational resource about [topic] for [audience] level.',
    tags: ['education', 'learning', 'teaching'],
    tone: 'educational',
    format: 'lesson',
    promptType: 'education',
  },
  {
    name: 'Technical Documentation Template',
    description: 'A template for technical documentation',
    content: 'Document the technical specifications for [system/feature].',
    tags: ['technical', 'documentation', 'specs'],
    tone: 'technical',
    format: 'documentation',
    promptType: 'technical',
  },
  {
    name: 'Research Analysis Template',
    description: 'A template for research analysis',
    content: 'Analyze the research findings on [topic] considering [methodology].',
    tags: ['research', 'analysis', 'academic'],
    tone: 'academic',
    format: 'research',
    promptType: 'research',
  },
  {
    name: 'Custom Template',
    description: 'A flexible template for custom needs',
    content: 'Create a [type] about [topic] with [specific requirements].',
    tags: ['custom', 'flexible', 'template'],
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

const ClientPromptCreate = memo(function ClientPromptCreate({ user }: { user: NavBarUser }) {
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

  // Memoize expensive computations
  const memoizedFormData = useMemo(() => formData, [formData]);
  const memoizedSelectedTags = useMemo(() => selectedTags, [selectedTags]);

  // Use effect for scroll behavior
  useEffect(() => {
    if (aiResponse && aiResponseRef.current) {
      const scrollTimeout = setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 100);
      setShowHighlight(true);
      const highlightTimeout = setTimeout(() => setShowHighlight(false), 2000);
      return () => {
        clearTimeout(scrollTimeout);
        clearTimeout(highlightTimeout);
      };
    }
  }, [aiResponse]);

  // Use effect for spinner message
  useEffect(() => {
    if (isLoading || isGenerating) {
      setSpinnerMessage(getRandomSpinnerMessage());
    }
  }, [isLoading, isGenerating]);

  // Use effect for medical warning
  useEffect(() => {
    setShowMedicalWarning(promptType === 'research');
  }, [promptType]);

  const handleTest = async () => {
    if (promptType === 'content-creation') {
      // Handle content creation test
    }
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
    if (promptType === 'content-creation') {
      // Handle content creation submission
    }
    setIsGenerating(true);
    setError(null);

    try {
      console.log('Form submitted');
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Received data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setGeneratedPrompt(data.generatedPrompt);
      setShowTestDialog(true);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prompt');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate prompt',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (promptType === 'content-creation') {
      // Handle content creation save
    }
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

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev: string[]) => {
      // If tag already exists, remove it
      if (prev.includes(tag)) {
        return prev.filter((t: string) => t !== tag);
      }
      // If tag doesn't exist, add it
      return [...prev, tag];
    });
  }, []);

  const addNewTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    
    // Reset error state
    setTagError(null);
    
    // Validate tag
    if (!trimmedTag) {
      setTagError('Tag cannot be empty');
      return;
    }
    
    if (selectedTags.includes(trimmedTag)) {
      setTagError('This tag already exists');
      return;
    }
    
    // Add the tag
    setSelectedTags(prev => [...prev, trimmedTag]);
    setNewTag('');
  }, [newTag, selectedTags]);

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

  const handlePromptTypeChange = (type: PromptType) => {
    setPromptType(type);
    const selectedType = PROMPT_TYPES.find(t => t.value === type);
    if (selectedType?.examples?.[0]) {
      const example = selectedType.examples[0];
      setFormData(prev => ({
        ...prev,
        name: example.name,
        description: example.description,
        content: example.content,
        tone: example.tone || 'professional',
        format: example.format || 'article',
        isPublic: false,
        tags: example.tags,
      }));
      // Set initial tags based on the example
      setSelectedTags(example.tags);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />
      {showMedicalWarning && <FloatingWarningBar onClose={() => setShowMedicalWarning(false)} />}
      <div className="container mx-auto px-4 py-8 relative">
        {isLoading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/70 dark:bg-black/70 rounded-lg">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <div className="flex gap-1 text-lg font-semibold text-purple-700 dark:text-purple-300">
              {spinnerMessage}
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>.</span>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,350px]">
            {/* Left: Main Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  {/* Prompt Type Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      <Label className="text-gray-700 dark:text-gray-200">Prompt Type</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                          </span>
                        </TooltipTrigger>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {PROMPT_TYPES.map(({ value, label, icon: Icon, description, color, examples }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handlePromptTypeChange(value)}
                          className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                            promptType === value
                              ? `bg-gradient-to-r ${color} border-transparent text-white shadow-lg`
                              : 'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                promptType === value
                                  ? 'bg-white/20'
                                  : 'bg-gray-100 group-hover:bg-purple-50 dark:bg-gray-700 dark:group-hover:bg-purple-900/20'
                              }`}
                            >
                              <Icon
                                className={`h-6 w-6 ${
                                  promptType === value
                                    ? 'text-white'
                                    : 'text-gray-600 group-hover:text-purple-600 dark:text-gray-300 dark:group-hover:text-purple-400'
                                }`}
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <h3
                                className={`font-medium ${
                                  promptType === value
                                    ? 'text-white'
                                    : 'text-gray-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400'
                                }`}
                              >
                                {label}
                              </h3>
                              <p
                                className={`mt-1 text-sm ${
                                  promptType === value
                                    ? 'text-white/90'
                                    : 'text-gray-500 group-hover:text-purple-500 dark:text-gray-400 dark:group-hover:text-purple-300'
                                }`}
                              >
                                {description}
                              </p>
                            </div>
                            {promptType === value && (
                              <div className="absolute right-2 top-2">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Persona Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="persona">AI Character / Persona</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                          </span>
                        </TooltipTrigger>
                      </Tooltip>
                    </div>
                    <Input
                      id="persona"
                      value={formData.persona}
                      onChange={e => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                      placeholder="e.g., Act as a designer"
                    />
                  </div>

                  {/* Name & Description */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label>Name</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                            </span>
                          </TooltipTrigger>
                        </Tooltip>
                      </div>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Debugging Error Message"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label>Description</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                            </span>
                          </TooltipTrigger>
                        </Tooltip>
                      </div>
                      <Textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Briefly explain what this prompt does"
                      />
                    </div>
                  </div>

                  {/* Language Field */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Prompt Language</Label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={e => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full rounded border bg-white px-2 py-1 text-gray-900 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select the language in which the AI should respond.
                    </p>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Label>Prompt Content</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                          </span>
                        </TooltipTrigger>
                      </Tooltip>
                    </div>
                    <Textarea
                      value={formData.content}
                      onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your AI prompt template with [variables] in brackets"
                      required
                      className="min-h-[120px] font-mono"
                    />
          
                  </div>

                  {/* Image Description Option - Only for content-creation type prompts */}
                  {promptType === 'content-creation' && (
                    <div className=" mt-4  mb-4 flex items-center space-x-2">
                      <Switch
                        id="includeImageDescription"
                        checked={formData.includeImageDescription}
                        onCheckedChange={checked =>
                          setFormData(prev => ({ ...prev, includeImageDescription: checked }))
                        }
                        className="data-[state=checked]:bg-purple-500"
                      />
                      <Label
          
                        htmlFor="includeImageDescription"
                        className=" flex items-center gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <Image className="h-4 w-4" /> Include image description in the prompt
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (Only for content-creation type prompts)
                        </span>
                      </Label>


                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0}>
                            <HelpCircle className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-500" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          When enabled, the AI will include a detailed image description in its
                          response.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {/* Tags & Visibility */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_TAGS.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-purple-500 text-white hover:bg-purple-600'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => toggleTag(tag)}
                        >
                          {selectedTags.includes(tag) ? (
                            <X className="mr-1 h-3 w-3" />
                          ) : (
                            <Plus className="mr-1 h-3 w-3" />
                          )}
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={newTag}
                        onChange={e => {
                          setNewTag(e.target.value);
                          setTagError(null);
                        }}
                        placeholder="Add custom tag"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewTag();
                          }
                        }}
                        className={tagError ? 'border-red-500' : ''}
                      />
                      <Button 
                        type="button" 
                        onClick={addNewTag} 
                        disabled={!newTag.trim() || selectedTags.includes(newTag.trim())}
                      >
                        Add Tag
                      </Button>
                    </div>
                    {tagError && (
                      <p className="mt-1 text-sm text-red-500">{tagError}</p>
                    )}
                  </div>

                  <div className=" mt-4  mb-4 flex items-center space-x-2">
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

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleTest}
                      disabled={isTesting || !formData.content}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Test Prompt in Playground
                        </>
                      )}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isGenerating || isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Prompt'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Response Section */}
              <Card
                ref={aiResponseRef}
                className={`border-gray-200 transition-all duration-500 dark:border-gray-800 ${
                  showHighlight
                    ? 'animate-fade-in border-purple-500 shadow-lg shadow-purple-500/20'
                    : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Response
                  </CardTitle>
                  <CardDescription>
                    {isGenerating
                      ? 'Generating your optimized prompt...'
                      : "Here's what the AI generated for your prompt. You can edit it before copying."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isGenerating ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="relative h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500">
                          <div className="absolute inset-0 rounded-full border-2 border-purple-200/30"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={editableAiResponse ?? ''}
                          onChange={e => setEditableAiResponse(e.target.value)}
                          className="min-h-[200px] rounded-lg border-gray-200 bg-gray-50 font-mono text-gray-900 transition-all duration-300 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            if (editableAiResponse) {
                              await navigator.clipboard.writeText(editableAiResponse);
                              toast({
                                title: 'Copied!',
                                description: 'Prompt copied to clipboard.',
                                variant: 'default',
                              });
                            }
                          }}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-300 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Sparkles className="h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Tips & Examples */}
            <div className="space-y-6">
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-purple-500" />
                    Tips for Creating Effective Prompts
                  </CardTitle>
                  <CardDescription>Best practices for creating high-quality prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li>Be specific about your desired output format</li>
                    <li>Include relevant context and constraints</li>
                    <li>Specify the tone and style you want</li>
                    <li>Mention any specific requirements or limitations</li>
                    <li>Use clear and concise language</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Temperature Card */}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-pink-500" />
                    Temperature
                  </CardTitle>
                  <CardDescription>Controls the creativity of the AI's responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature" className="text-gray-700 dark:text-gray-200">
                        Temperature
                      </Label>
                      <span className="font-mono text-xs text-purple-600 dark:text-purple-300">
                        {formData.temperature}
                      </span>
                    </div>
                    <input
                      id="temperature"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={formData.temperature}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))
                      }
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Deterministic (0)</span>
                      <span>Creative (1)</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-purple-600 dark:text-purple-300">
                        What is temperature?
                      </span>{' '}
                      Lower values make the AI more focused and predictable. Higher values make it
                      more creative and diverse. For most use cases, 0.7 is a good starting point.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Example Prompts
                  </CardTitle>
                  <CardDescription>Browse through example prompts for inspiration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {EXAMPLE_PROMPTS.filter(
                      (example: ExamplePrompt) => example.promptType === promptType
                    ).map((example: ExamplePrompt, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => {
                          const newTags = example.tags || [];
                          setFormData(prev => ({
                            ...prev,
                            name: example.name,
                            description: example.description,
                            content: example.content,
                            tone: example.tone || '',
                            format: example.format || '',
                            style: example.style || '',
                            resolution: example.resolution || '',
                            palette: example.palette || '',
                            duration: example.duration || '',
                            genre: example.genre || '',
                            mood: example.mood || '',
                            length: example.length || '',
                            instruments: example.instruments || '',
                            isPublic: false,
                            tags: newTags,
                          }));
                          setSelectedTags(newTags);
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          formData.name === example.name
                            ? 'border-purple-500 bg-purple-50 shadow-sm dark:bg-gray-800'
                            : 'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-700'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {example.name}
                        </div>
                        <div className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {example.description}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {example.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-purple-100 text-xs text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {example.tags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            >
                              +{example.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {promptType === 'research' && selectedTags.some(tag => tag.includes('medical')) && (
                    <MedicalDisclaimer />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      <InsufficientCreditsDialog
        open={showCreditsDialog}
        onOpenChange={setShowCreditsDialog}
        currentCredits={creditsInfo.currentCredits}
        requiredCredits={creditsInfo.requiredCredits}
        missingCredits={creditsInfo.missingCredits}
      />
      {/* Test Results Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Review Generated Prompt</DialogTitle>
            <DialogDescription className="text-base">
              Review the AI-generated prompt and test it before saving. You can make adjustments and test multiple times.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Generated Prompt Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Generated Prompt
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt || '');
                    toast({
                      title: 'Copied!',
                      description: 'Prompt copied to clipboard',
                    });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="relative">
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg border overflow-x-auto">
                  <ReactMarkdown>{generatedPrompt || ''}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Test Result Section */}
            {testResult ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-500" />
                    Test Result
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(testResult);
                      toast({
                        title: 'Copied!',
                        description: 'Test result copied to clipboard',
                      });
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="relative">
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg border overflow-x-auto">
                    <ReactMarkdown>{testResult}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : null}

            {/* AI Response Section */}
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
                      navigator.clipboard.writeText(testResult);
                      toast({
                        title: 'Copied!',
                        description: 'AI response copied to clipboard',
                      });
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="relative">
                  <Textarea
                    value={testResult}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-muted border"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  />
                </div>
              </div>
            ) : null}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <X className="h-5 w-5" />
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
    </div>
  );
});

export default ClientPromptCreate;
