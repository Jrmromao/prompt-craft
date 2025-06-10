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
} from '@/components/ui/dialog';
import { useUser } from '@clerk/nextjs';
import { FloatingWarningBar } from '@/components/support/FloatingWarningBar';

const PROMPT_TYPES: {
  value: PromptType;
  label: string;
  icon: any;
  description: string;
  color: string;
}[] = [
  {
    value: 'text',
    label: 'Text',
    icon: BookOpen,
    description: 'Create text-based prompts for articles, stories, and general content',
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: 'image',
    label: 'Image',
    icon: Image,
    description: 'Generate prompts for image creation and visual content',
    color: 'from-purple-500 to-purple-600',
  },
  {
    value: 'video',
    label: 'Video',
    icon: Video,
    description: 'Create prompts for video content and motion graphics',
    color: 'from-pink-500 to-pink-600',
  },
  {
    value: 'music',
    label: 'Music',
    icon: Music,
    description: 'Generate prompts for music and audio content',
    color: 'from-green-500 to-green-600',
  },
  {
    value: 'software',
    label: 'Software',
    icon: Code2,
    description: 'Create prompts for coding and software development',
    color: 'from-orange-500 to-orange-600',
  },
  {
    value: 'medical',
    label: 'Medical',
    icon: Stethoscope,
    description: 'Generate prompts for medical documentation and healthcare content',
    color: 'from-red-500 to-red-600',
  },
];

const COMMON_TAGS = Array.from(
  new Set([
    'creative',
    'business',
    'social-media',
    'twitter/X',
    'instagram',
    'facebook',
    'content',
    'writing',
    'technical',
    'educational',
    'entertainment',
    'news',
    'review',
    'storytelling',
    'tutorial',
    'guide',
    'story',
    'script',
    'email',
    'analysis',
    'product',
    'photography',
    'character',
    'design',
    'marketing',
    'jingle',
    'soundtrack',
    'emotional',
    'developer',
    'architect',
    'problem-solving',
    'advanced',
    'debugging',
    'error',
    'troubleshooting',
    'algorithm',
    'performance',
    'API',
    'setup',
    'code review',
    'quality',
    'security',
    'testing',
    'bugfix',
    'market-research',
    'image',
    'video',
    'music',
    'background',
    'ambient',
    'upbeat',
    'branding',
    'software',
    'language-specific',
    'framework',
    'dependency',
    'documentation',
    'optimization',
    'integration',
    'library',
    'refactor',
    'engineering',
    'medical',
    'healthcare',
    'clinical',
    'patient',
    'diagnosis',
    'treatment',
    'research',
    'documentation',
    'compliance',
    'HIPAA',
    'medical-writing',
    'case-study',
    'medical-education',
  ])
);

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
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  // Text Prompts
  {
    name: 'Tweet Prompt Generator',
    description: 'Create a template for generating engaging tweets',
    content:
      'Create a prompt template for generating tweets about [topic] that includes:\n- Hook structure: [type of hook]\n- Key message points: [number] main points\n- Call to action format: [CTA style]\n- Hashtag strategy: [number] relevant hashtags\n\nTarget audience: [audience]\nTone: [tone]\nLength: [character count]',
    tags: ['social-media', 'twitter/X', 'content'],
    tone: 'casual',
    format: 'social-media',
    promptType: 'text',
  },
  {
    name: 'Story Prompt Template',
    description: 'Create a template for generating story ideas',
    content:
      'Create a prompt template for a [genre] story that includes:\n- Setting: [type of setting]\n- Main character traits: [number] key traits\n- Conflict type: [conflict style]\n- Theme elements: [themes to explore]\n\nTarget audience: [audience]\nTone: [tone]\nLength: [word count]',
    tags: ['creative', 'writing', 'storytelling'],
    tone: 'creative',
    format: 'story',
    promptType: 'text',
  },
  {
    name: 'Business Analysis Prompt',
    description: 'Create a template for generating business analysis prompts',
    content:
      'Create a prompt template for analyzing [industry] that includes:\n- Market aspects to analyze: [key areas]\n- Data points to consider: [specific metrics]\n- Comparison factors: [elements to compare]\n- Output format: [analysis structure]\n\nTarget audience: [audience]\nTone: [tone]\nDepth: [analysis level]',
    tags: ['business', 'analysis', 'market-research'],
    tone: 'professional',
    format: 'article',
    promptType: 'text',
  },
  // Image Prompts
  {
    name: 'Product Photo Prompt',
    description: 'Create a template for generating product photo prompts',
    content:
      'Create a prompt template for product photography of [product type] that includes:\n- Style guidelines: [photography style]\n- Lighting requirements: [lighting setup]\n- Background specifications: [background type]\n- Composition rules: [composition guidelines]\n\nTarget audience: [audience]\nStyle: [style]\nResolution: [resolution]',
    tags: ['image', 'product', 'photography'],
    style: 'photorealistic',
    resolution: '1024x1024',
    palette: 'professional',
    promptType: 'image',
  },
  {
    name: 'Character Design Prompt',
    description: 'Create a template for generating character design prompts',
    content:
      'Create a prompt template for character design that includes:\n- Character type: [species/type]\n- Personality traits: [key traits]\n- Visual style: [art style]\n- Key features: [distinctive elements]\n\nTarget audience: [audience]\nStyle: [style]\nResolution: [resolution]',
    tags: ['image', 'character', 'design'],
    style: 'cartoon',
    resolution: '1024x1024',
    palette: 'vibrant',
    promptType: 'image',
  },
  // Video Prompts
  {
    name: 'Product Demo Prompt',
    description: 'Create a template for generating product demo video prompts',
    content:
      'Create a prompt template for a product demo video that includes:\n- Introduction structure: [intro format]\n- Feature presentation: [number] key features\n- Use case scenarios: [scenario types]\n- Call to action format: [CTA style]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [duration]',
    tags: ['video', 'product', 'marketing'],
    style: 'professional',
    duration: '60s',
    resolution: '1920x1080',
    promptType: 'video',
  },
  {
    name: 'Tutorial Video Prompt',
    description: 'Create a template for generating tutorial video prompts',
    content:
      'Create a prompt template for a tutorial video that includes:\n- Topic breakdown: [main topic]\n- Step structure: [number] key steps\n- Visual requirements: [visual elements]\n- Learning objectives: [key takeaways]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [duration]',
    tags: ['video', 'tutorial', 'educational'],
    style: 'educational',
    duration: '5min',
    resolution: '1920x1080',
    promptType: 'video',
  },
  // Music Prompts
  {
    name: 'Background Music Prompt',
    description: 'Create a template for generating background music prompts',
    content:
      'Create a prompt template for background music that includes:\n- Genre specifications: [music genre]\n- Mood requirements: [emotional tone]\n- Instrumentation: [key instruments]\n- Structure elements: [musical structure]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [length]',
    tags: ['music', 'background', 'ambient'],
    genre: 'ambient',
    mood: 'calm',
    length: '2min',
    instruments: 'piano, strings, pads',
    promptType: 'music',
  },
  {
    name: 'Jingle Creation',
    description: 'Create catchy brand jingles',
    content:
      'Create a brand jingle for [brand] with:\n- Style: [style]\n- Mood: [mood]\n- Key instruments: [instruments]\n- Duration: [duration]\n- Key message: [message]',
    tags: ['music', 'jingle', 'branding'],
    genre: 'pop',
    mood: 'upbeat',
    length: '30s',
    instruments: 'synth, drums, bass',
    promptType: 'music',
  },
  {
    name: 'Soundtrack',
    description: 'Generate emotional soundtracks',
    content:
      'Create a soundtrack piece that conveys [emotion] with:\n- Genre: [genre]\n- Mood: [mood]\n- Instruments: [instruments]\n- Structure: [structure]\n- Duration: [duration]',
    tags: ['music', 'soundtrack', 'emotional'],
    genre: 'orchestral',
    mood: 'dramatic',
    length: '3min',
    instruments: 'orchestra, choir',
    promptType: 'music',
  },
  {
    name: 'Software Prompt Template',
    description: 'Create a template for generating prompts to solve advanced software problems',
    content: `Create a prompt template for solving advanced software engineering problems. The template should include:
  - Problem context: [describe the system, domain, or use case]
  - Specific requirements: [list all functional and non-functional requirements]
  - Input and output formats: [define expected inputs and outputs]
  - Constraints: [performance, security, scalability, etc.]
  - Edge cases: [list possible edge cases to consider]
  - Error handling: [how should errors be managed?]
  - Example scenarios: [provide at least one example input and expected output]
  - Technologies or tools: [specify any required frameworks, languages, or libraries]
  - Testing: [describe how the solution should be tested]
  - Additional notes: [any other relevant information]
  
  Target audience: [developer, architect, etc.]
  Level: [beginner, intermediate, advanced]`,
    tags: ['software', 'engineering', 'problem-solving', 'advanced'],
    tone: 'professional',
    format: 'technical',
    promptType: 'software',
  },
  {
    name: 'Debugging Error Message',
    description: 'Create a prompt template for debugging a specific error message in code.',
    content: `Create a prompt template for debugging the following error message in [programming language] (version: [version], libraries: [libraries]):
  
  Error message: [paste error message here]
  
  The template should include:
  - Problem context
  - Steps to reproduce
  - Expected vs actual behavior
  - Code snippets (if available)
  - Troubleshooting steps
  - Suggestions for further investigation
  - Any relevant documentation or resources
  `,
    tags: ['software', 'debugging', 'error', 'troubleshooting', 'language-specific'],
    tone: 'professional',
    format: 'technical',
    promptType: 'software',
  },
  {
    name: 'Optimize Algorithm',
    description:
      'Create a prompt template for optimizing an algorithm in a specific language or library.',
    content: `Create a prompt template for optimizing the following algorithm in [programming language] (version: [version], libraries: [libraries]):
  
  Algorithm description: [describe algorithm or paste code]
  
  The template should include:
  - Current performance metrics
  - Constraints (time, space, etc.)
  - Desired improvements
  - Edge cases
  - Testing requirements
  - Any relevant documentation or resources
  `,
    tags: ['software', 'optimization', 'algorithm', 'performance', 'language-specific'],
    tone: 'professional',
    format: 'technical',
    promptType: 'software',
  },
  {
    name: 'Integrate Third-Party Library',
    description: 'Create a prompt template for integrating a third-party library or API.',
    content: `Create a prompt template for integrating the [library/API name] (version: [version]) into a [programming language] project.
  
  The template should include:
  - Project context
  - Library/API purpose
  - Installation steps
  - Example usage
  - Common pitfalls
  - Version compatibility notes
  - Testing and validation steps
  - Any relevant documentation or resources
  `,
    tags: ['software', 'integration', 'library', 'API', 'setup', 'language-specific'],
    tone: 'professional',
    format: 'technical',
    promptType: 'software',
  },
  {
    name: 'Code Review Checklist',
    description: 'Create a prompt template for reviewing code in a specific language or framework.',
    content: `Create a prompt template for reviewing code written in [programming language] (version: [version], libraries: [libraries]).
  
  The template should include:
  - Code style and conventions
  - Correctness and logic
  - Security considerations
  - Performance
  - Test coverage
  - Documentation
  - Suggestions for improvement
  `,
    tags: ['software', 'code review', 'quality', 'security', 'language-specific'],
    tone: 'professional',
    format: 'technical',
    promptType: 'software',
  },
  // Medical Prompts
  {
    name: 'Medical Case Study Template',
    description: 'Create a template for generating detailed medical case studies',
    content: `IMPORTANT: This template is for educational purposes only. Always consult with qualified healthcare professionals for actual medical decisions.

Create a medical case study template that includes:
- Patient demographics: [age, gender, relevant history]
- Presenting symptoms: [chief complaint and duration]
- Medical history: [relevant conditions, medications, allergies]
- Physical examination findings: [vital signs, relevant exam details]
- Diagnostic tests: [lab results, imaging, other tests]
- Assessment: [differential diagnosis]
- Treatment plan: [medications, procedures, follow-up]
- Outcome: [patient response, complications, resolution]

Target audience: [medical professionals, students, etc.]
Format: [structured case report]
Include references: [yes/no]
Include disclaimer: [yes/no]`,
    tags: ['medical', 'case-study', 'documentation', 'clinical'],
    tone: 'professional',
    format: 'medical-report',
    promptType: 'medical',
  },
  {
    name: 'Patient Education Material',
    description: 'Create a template for generating patient education materials',
    content: `IMPORTANT: This material should be reviewed by healthcare professionals before distribution to patients.

Create a patient education template about [medical condition/treatment] that includes:
- Overview: [condition/treatment explanation]
- Symptoms/Side effects: [what to expect]
- Treatment options: [available approaches]
- Self-care instructions: [home care guidelines]
- Warning signs: [when to seek medical attention]
- Lifestyle modifications: [recommended changes]
- Follow-up care: [appointment schedule, monitoring]

Target audience: [patient education level]
Language level: [basic, intermediate, advanced]
Include visual aids: [yes/no]
Include medical review statement: [yes/no]`,
    tags: ['medical', 'patient', 'education', 'documentation'],
    tone: 'clear',
    format: 'patient-education',
    promptType: 'medical',
  },
  {
    name: 'Clinical Research Protocol',
    description: 'Create a template for generating clinical research protocols',
    content: `IMPORTANT: This template should be reviewed by qualified researchers and institutional review boards (IRB) before implementation.

Create a clinical research protocol template that includes:
- Study title: [research question]
- Background: [literature review, rationale]
- Objectives: [primary and secondary endpoints]
- Methodology: [study design, population, interventions]
- Data collection: [variables, measurements, timeline]
- Statistical analysis: [methods, sample size]
- Ethical considerations: [informed consent, IRB]
- Timeline: [study duration, milestones]

Target audience: [researchers, IRB, funding agencies]
Study type: [observational, interventional, etc.]
Compliance requirements: [specific regulations]
Include ethical review statement: [yes/no]`,
    tags: ['medical', 'research', 'clinical', 'documentation'],
    tone: 'scientific',
    format: 'research-protocol',
    promptType: 'medical',
  },
  {
    name: 'Medical Documentation Template',
    description: 'Create a template for generating standardized medical documentation',
    content: `IMPORTANT: This template should be used in accordance with local medical regulations and institutional policies.

Create a medical documentation template for [specialty/condition] that includes:
- Patient information: [demographics, identifiers]
- Chief complaint: [patient's main concern]
- History of present illness: [symptom progression]
- Review of systems: [pertinent positives/negatives]
- Physical examination: [relevant findings]
- Assessment: [diagnoses, problems]
- Plan: [treatment, medications, follow-up]
- Notes: [additional observations]

Target audience: [healthcare providers]
Specialty: [specific medical field]
Compliance: [HIPAA, specific requirements]
Include compliance statement: [yes/no]`,
    tags: ['medical', 'documentation', 'clinical', 'HIPAA'],
    tone: 'professional',
    format: 'medical-note',
    promptType: 'medical',
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
  promptType: string;
  persona?: string;
  includeImageDescription?: boolean;
}

const ClientPromptCreate = memo(function ClientPromptCreate({ user }: { user: NavBarUser }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('text');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    content: '',
    isPublic: false,
    tags: [],
    tone: '',
    format: '',
    wordCount: '',
    targetAudience: '',
    includeExamples: false,
    includeKeywords: false,
    temperature: 0.7,
    language: 'en',
    promptType: 'text',
    persona: '',
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
    setShowMedicalWarning(promptType === 'medical');
  }, [promptType]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);

    if (isLoading) {
      console.log('Form submission blocked - already loading');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Setting loading state to true');

      // Prepare the prompt data
      const promptData = {
        title: formData.name.trim(),
        content: formData.content.trim(),
        description: formData.description.trim(),
        tags: selectedTags,
        isPublic: formData.isPublic || false,
        temperature: formData.temperature || 0.7,
        language: formData.language || 'en',
        promptType: formData.promptType || 'text',
        persona: formData.persona || '',
      };

      console.log('Submitting prompt data:', promptData);

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error Response:', errorData);
        throw new Error(errorData?.message || 'Failed to create prompt');
      }

      const data = await response.json();
      console.log('Success response:', data);

      toast({
        title: 'Success!',
        description: 'Your prompt has been created successfully.',
      });

      router.push(`/prompts/${data.savedPrompt.id}`);
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('Setting loading state to false');
    }
  }, [formData, selectedTags, isLoading, router, toast]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev: string[]) => (prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]));
  }, []);

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
                      {PROMPT_TYPES.map(({ value, label, icon: Icon, description, color }) => (
                        <button
                          key={value}
                          onClick={() => setPromptType(value)}
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
                    {/* Test in Playground Button & Modal */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          Test in Playground
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Test Prompt in Playground</DialogTitle>
                        </DialogHeader>
                        <Playground initialPrompt={formData.content} showTitle={false} />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Image Description Option - Only for text type prompts */}
                  {promptType === 'text' && (
                    <div className="flex items-center space-x-2">
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
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                      >
                        <Image className="h-4 w-4" /> Include image description in the prompt
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
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <Plus className="mr-1 h-3 w-3" />
                          )}
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {getRandomSpinnerMessage()}
                        </>
                      ) : (
                        'Create Prompt'
                      )}
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
                  {promptType === 'medical' && selectedTags.some(tag => tag.includes('medical')) && (
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
    </div>
  );
});

export default ClientPromptCreate;
