'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Info, Sparkles, Tag, Lock, Globe, Plus, Check, BookOpen, Image, Video, Music, Code2 } from "lucide-react";
import { sendPromptToLLM } from "@/services/aiService";
import type { PromptPayload, PromptType } from "@/types/ai";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavBarUser } from '@/components/layout/NavBar';
import { NavBar } from '@/components/layout/NavBar';

const PROMPT_TYPES: { value: PromptType; label: string; icon: any }[] = [
  { value: "text", label: "Text", icon: BookOpen },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
  { value: "music", label: "Music", icon: Music },
  { value: "software", label: "Software", icon: Code2 },
];

const COMMON_TAGS = Array.from(new Set([
  "creative", "business", "social-media", "twitter/X", "instagram", "facebook", "content",
  "writing", "technical", "educational", "entertainment", "news", "review", "storytelling",
  "tutorial", "guide", "story", "script", "email", "analysis", "product", "photography",
  "character", "design", "marketing", "jingle", "soundtrack", "emotional", "developer",
  "architect", "problem-solving", "advanced", "debugging", "error", "troubleshooting",
  "algorithm", "performance", "API", "setup", "code review", "quality", "security", "testing",
  "bugfix", "market-research", "image", "video", "music", "background", "ambient", "upbeat",
  "branding", "software", "language-specific", "framework", "dependency", "documentation",
  "optimization", "integration", "library", "refactor", "engineering"
]));


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
    name: "Tweet Prompt Generator",
    description: "Create a template for generating engaging tweets",
    content: "Create a prompt template for generating tweets about [topic] that includes:\n- Hook structure: [type of hook]\n- Key message points: [number] main points\n- Call to action format: [CTA style]\n- Hashtag strategy: [number] relevant hashtags\n\nTarget audience: [audience]\nTone: [tone]\nLength: [character count]",
    tags: ["social-media", "twitter/X", "content"],
    tone: "casual",
    format: "social-media",
    promptType: "text"
  },
  {
    name: "Story Prompt Template",
    description: "Create a template for generating story ideas",
    content: "Create a prompt template for a [genre] story that includes:\n- Setting: [type of setting]\n- Main character traits: [number] key traits\n- Conflict type: [conflict style]\n- Theme elements: [themes to explore]\n\nTarget audience: [audience]\nTone: [tone]\nLength: [word count]",
    tags: ["creative", "writing", "storytelling"],
    tone: "creative",
    format: "story",
    promptType: "text"
  },
  {
    name: "Business Analysis Prompt",
    description: "Create a template for generating business analysis prompts",
    content: "Create a prompt template for analyzing [industry] that includes:\n- Market aspects to analyze: [key areas]\n- Data points to consider: [specific metrics]\n- Comparison factors: [elements to compare]\n- Output format: [analysis structure]\n\nTarget audience: [audience]\nTone: [tone]\nDepth: [analysis level]",
    tags: ["business", "analysis", "market-research"],
    tone: "professional",
    format: "article",
    promptType: "text"
  },
  // Image Prompts
  {
    name: "Product Photo Prompt",
    description: "Create a template for generating product photo prompts",
    content: "Create a prompt template for product photography of [product type] that includes:\n- Style guidelines: [photography style]\n- Lighting requirements: [lighting setup]\n- Background specifications: [background type]\n- Composition rules: [composition guidelines]\n\nTarget audience: [audience]\nStyle: [style]\nResolution: [resolution]",
    tags: ["image", "product", "photography"],
    style: "photorealistic",
    resolution: "1024x1024",
    palette: "professional",
    promptType: "image"
  },
  {
    name: "Character Design Prompt",
    description: "Create a template for generating character design prompts",
    content: "Create a prompt template for character design that includes:\n- Character type: [species/type]\n- Personality traits: [key traits]\n- Visual style: [art style]\n- Key features: [distinctive elements]\n\nTarget audience: [audience]\nStyle: [style]\nResolution: [resolution]",
    tags: ["image", "character", "design"],
    style: "cartoon",
    resolution: "1024x1024",
    palette: "vibrant",
    promptType: "image"
  },
  // Video Prompts
  {
    name: "Product Demo Prompt",
    description: "Create a template for generating product demo video prompts",
    content: "Create a prompt template for a product demo video that includes:\n- Introduction structure: [intro format]\n- Feature presentation: [number] key features\n- Use case scenarios: [scenario types]\n- Call to action format: [CTA style]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [duration]",
    tags: ["video", "product", "marketing"],
    style: "professional",
    duration: "60s",
    resolution: "1920x1080",
    promptType: "video"
  },
  {
    name: "Tutorial Video Prompt",
    description: "Create a template for generating tutorial video prompts",
    content: "Create a prompt template for a tutorial video that includes:\n- Topic breakdown: [main topic]\n- Step structure: [number] key steps\n- Visual requirements: [visual elements]\n- Learning objectives: [key takeaways]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [duration]",
    tags: ["video", "tutorial", "educational"],
    style: "educational",
    duration: "5min",
    resolution: "1920x1080",
    promptType: "video"
  },
  // Music Prompts
  {
    name: "Background Music Prompt",
    description: "Create a template for generating background music prompts",
    content: "Create a prompt template for background music that includes:\n- Genre specifications: [music genre]\n- Mood requirements: [emotional tone]\n- Instrumentation: [key instruments]\n- Structure elements: [musical structure]\n\nTarget audience: [audience]\nStyle: [style]\nDuration: [length]",
    tags: ["music", "background", "ambient"],
    genre: "ambient",
    mood: "calm",
    length: "2min",
    instruments: "piano, strings, pads",
    promptType: "music"
  },
  {
    name: "Jingle Creation",
    description: "Create catchy brand jingles",
    content: "Create a brand jingle for [brand] with:\n- Style: [style]\n- Mood: [mood]\n- Key instruments: [instruments]\n- Duration: [duration]\n- Key message: [message]",
    tags: ["music", "jingle", "branding"],
    genre: "pop",
    mood: "upbeat",
    length: "30s",
    instruments: "synth, drums, bass",
    promptType: "music"
  },
  {
    name: "Soundtrack",
    description: "Generate emotional soundtracks",
    content: "Create a soundtrack piece that conveys [emotion] with:\n- Genre: [genre]\n- Mood: [mood]\n- Instruments: [instruments]\n- Structure: [structure]\n- Duration: [duration]",
    tags: ["music", "soundtrack", "emotional"],
    genre: "orchestral",
    mood: "dramatic",
    length: "3min",
    instruments: "orchestra, choir",
    promptType: "music"
  },
  {
    name: "Software Prompt Template",
    description: "Create a template for generating prompts to solve advanced software problems",
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
    tags: ["software", "engineering", "problem-solving", "advanced"],
    tone: "professional",
    format: "technical",
    promptType: "software"
  },
  {
    name: "Debugging Error Message",
    description: "Create a prompt template for debugging a specific error message in code.",
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
    tags: ["software", "debugging", "error", "troubleshooting", "language-specific"],
    tone: "professional",
    format: "technical",
    promptType: "software"
  },
  {
    name: "Optimize Algorithm",
    description: "Create a prompt template for optimizing an algorithm in a specific language or library.",
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
    tags: ["software", "optimization", "algorithm", "performance", "language-specific"],
    tone: "professional",
    format: "technical",
    promptType: "software"
  },
  {
    name: "Integrate Third-Party Library",
    description: "Create a prompt template for integrating a third-party library or API.",
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
    tags: ["software", "integration", "library", "API", "setup", "language-specific"],
    tone: "professional",
    format: "technical",
    promptType: "software"
  },
  {
    name: "Code Review Checklist",
    description: "Create a prompt template for reviewing code in a specific language or framework.",
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
    tags: ["software", "code review", "quality", "security", "language-specific"],
    tone: "professional",
    format: "technical",
    promptType: "software"
  },
];

function getRandomSpinnerMessage() {
  const SPINNER_MESSAGES = [
    "Cooking up the perfect prompt… 🍳",
    "Asking the AI for its best-kept secrets… 🤫",
    "Sharpening the pencils in the prompt factory… ✏️",
    "Summoning prompt magic… 🪄",
    "Letting the robots brainstorm… 🤖💡",
  ];
  return SPINNER_MESSAGES[Math.floor(Math.random() * SPINNER_MESSAGES.length)];
}

export default function ClientPromptCreate({ user }: { user: NavBarUser }) {
  const { toast } = useToast();
  const router = useRouter();
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>("text");
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    content: "",
    isPublic: false,
    tags: [],
    tone: "",
    format: "",
    wordCount: "",
    targetAudience: "",
    includeExamples: false,
    includeKeywords: false,
    includeStructure: false,
    style: "",
    resolution: "",
    palette: "",
    duration: "",
    genre: "",
    mood: "",
    length: "",
    instruments: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editableAiResponse, setEditableAiResponse] = useState<string | null>(null);
  const [spinnerMessage, setSpinnerMessage] = useState(getRandomSpinnerMessage());

  useEffect(() => {
    if (aiResponse && aiResponseRef.current) {
      setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 100);
      setShowHighlight(true);
      const timer = setTimeout(() => setShowHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [aiResponse]);

  useEffect(() => {
    if (isLoading || isGenerating) {
      setSpinnerMessage(getRandomSpinnerMessage());
    }
  }, [isLoading, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast({ title: "Validation Error", description: "Name and Prompt Content are required.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setIsGenerating(true);
    setAiResponse(null);
    try {
      const llmPayload: PromptPayload = {
        ...formData,
        tags: selectedTags,
        promptType,
        content: `Create a prompt template based on the following requirements:\n\n${formData.content}\n\nGenerate a reusable prompt template that others can use to create ${promptType} content. The template should include clear instructions and placeholders for customization.`,
      };
      let llmResponse;
      try {
        llmResponse = await sendPromptToLLM(llmPayload);
        setAiResponse(llmResponse);
        setEditableAiResponse(llmResponse);
        toast({ title: "Success", description: "Prompt template generated successfully" });
      } catch (llmError: any) {
        toast({ title: "LLM Error", description: llmError instanceof Error ? llmError.message : "Failed to get LLM response", variant: "destructive" });
        return;
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ... (inject the fadeInUp and wave keyframes as before) ...

  // ... (return the full JSX for the form, spinner, AI response, tips, and examples) ...

  return (
    <>

      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col relative">
        {(isLoading || isGenerating) && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mb-6"></div>
            <div
              className="text-lg font-medium text-purple-700 dark:text-purple-300 text-center px-4"
              style={{ display: 'inline-block', whiteSpace: 'pre', animation: "fadeInUp 0.7s cubic-bezier(.4,0,.2,1)" }}
            >
              {spinnerMessage.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    animation: `wave 1.2s infinite`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto w-full py-10 px-4 md:px-8 flex flex-col md:flex-row gap-8">
          {/* Left: Form */}
          <div className="flex-1 space-y-8">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
                >
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Create New AI Prompt
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Create a reusable prompt template for AI interactions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Type Selection */}
                <div>
                  <Label className="mb-2 block text-gray-700 dark:text-gray-200">
                    Prompt Type
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {PROMPT_TYPES.map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={promptType === value ? "default" : "outline"}
                        onClick={() => setPromptType(value)}
                        className={`w-full h-20 flex flex-col items-center justify-center gap-2 ${
                          promptType === value
                            ? "bg-purple-500 hover:bg-purple-600 text-white"
                            : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span>{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Name & Description */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Debugging Error Message"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Briefly explain what this prompt does"
                    />
                  </div>
                </div>
                {/* Content */}
                <div className="space-y-2">
                  <Label>Prompt Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your AI prompt template with [variables] in brackets"
                    required
                    className="min-h-[120px] font-mono"
                  />
                </div>
                {/* Tags & Visibility */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {(COMMON_TAGS).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-purple-500 hover:bg-purple-600 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {selectedTags.includes(tag) ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
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
                    onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
                    className="data-[state=checked]:bg-purple-500"
                  />
                  <Label htmlFor="isPublic" className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    {formData.isPublic ? (
                      <>
                        <Globe className="w-4 h-4" /> Make prompt public
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Keep prompt private
                      </>
                    )}
                  </Label>
                </div>
              </CardContent>
            </Card>
            {/* AI Response Section */}
            <Card
              ref={aiResponseRef}
              className={`border-gray-200 dark:border-gray-800 transition-all duration-500 ${
                showHighlight ? "border-purple-500 shadow-lg shadow-purple-500/20 animate-fade-in" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Response
                </CardTitle>
                <CardDescription>
                  {isGenerating
                    ? "Generating your optimized prompt..."
                    : "Here's what the AI generated for your prompt. You can edit it before copying."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-200/30"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={editableAiResponse ?? ""}
                        onChange={e => setEditableAiResponse(e.target.value)}
                        className="min-h-[200px] font-mono bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg transition-all duration-300"
                      />
                      <Button
                        type="button"
                        onClick={async () => {
                          if (editableAiResponse) {
                            await navigator.clipboard.writeText(editableAiResponse);
                            toast({
                              title: "Copied!",
                              description: "Prompt copied to clipboard.",
                              variant: "default",
                            });
                          }
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2 transition-all duration-300"
                      >
                        <Sparkles className="w-4 h-4" />
                        Copy to Clipboard
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right: Tips & Examples */}
          <div className="w-full md:w-[350px] space-y-6">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-purple-500" />
                  Tips for Creating Effective Prompts
                </CardTitle>
                <CardDescription>
                  Best practices for creating high-quality prompts
                </CardDescription>
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
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Example Prompts
                </CardTitle>
                <CardDescription>
                  Browse through example prompts for inspiration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {EXAMPLE_PROMPTS.filter((example: ExamplePrompt) => example.promptType === promptType).map((example: ExamplePrompt, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newTags = example.tags || [];
                        setFormData({
                          ...formData,
                          name: example.name,
                          description: example.description,
                          content: example.content,
                          tone: example.tone || "",
                          format: example.format || "",
                          style: example.style || "",
                          resolution: example.resolution || "",
                          palette: example.palette || "",
                          duration: example.duration || "",
                          genre: example.genre || "",
                          mood: example.mood || "",
                          length: example.length || "",
                          instruments: example.instruments || "",
                          isPublic: false,
                          tags: newTags
                        });
                        setSelectedTags(newTags);
                      }}
                      className={`w-full p-3 text-left rounded-lg border transition-all ${
                        formData.name === example.name
                          ? "border-purple-500 bg-purple-50 dark:bg-gray-800 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800"
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{example.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{example.description}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {example.tags.slice(0, 3).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {example.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          >
                            +{example.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 z-50 flex justify-center">
          <div className="max-w-7xl w-full flex justify-end px-4 md:px-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? "Creating..." : "Create Prompt"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 