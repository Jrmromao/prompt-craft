'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Wand2, 
  Brain, 
  Zap, 
  Target, 
  Play, 
  Save, 
  Share2, 
  Settings2,
  Lightbulb,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Code,
  FileText,
  Users,
  BarChart3,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  MoreHorizontal,
  Star,
  Bookmark,
  History,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Table,
  Quote,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptEditorProps {
  initialPrompt?: string;
  onSave?: (prompt: string) => void;
  onTest?: (prompt: string) => void;
}

interface EditorSettings {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  model: string;
  autoSave: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export function PremiumPromptEditor({ initialPrompt = '', onSave, onTest }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    clarity: 0,
    specificity: 0,
    effectiveness: 0,
    cost: 0
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [settings, setSettings] = useState<EditorSettings>({
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    maxTokens: 1000,
    model: 'gpt-4',
    autoSave: true,
    wordWrap: true,
    showLineNumbers: true,
    theme: 'auto'
  });

  // Update word and character count
  useEffect(() => {
    const words = prompt.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = prompt.length;
    setWordCount(words);
    setCharCount(chars);
    setHasUnsavedChanges(prompt !== initialPrompt);
  }, [prompt, initialPrompt]);

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [prompt, settings.autoSave, hasUnsavedChanges]);

  // AI-powered suggestions
  const generateSuggestions = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'improvements' })
      });
      
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
      toast.success('AI suggestions generated');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  // Analyze prompt performance
  const analyzePrompt = async () => {
    if (!prompt.trim()) return;
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      setPerformanceMetrics(data.metrics || {
        clarity: 85,
        specificity: 78,
        effectiveness: 92,
        cost: 0.12
      });
    } catch (error) {
      console.error('Error analyzing prompt:', error);
    }
  };

  // Save functionality
  const handleSave = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to save');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(prompt);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast.success('Prompt saved successfully');
    } catch (error) {
      toast.error('Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  // Test functionality
  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to test');
      return;
    }

    try {
      await onTest?.(prompt);
      toast.success('Test initiated');
    } catch (error) {
      toast.error('Failed to start test');
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy prompt');
    }
  };

  // Download prompt
  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompt downloaded');
  };

  // Upload prompt
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPrompt(content);
        toast.success('Prompt uploaded');
      };
      reader.readAsText(file);
    }
  };

  // Clear prompt
  const handleClear = () => {
    setPrompt('');
    setAiSuggestions([]);
    setPerformanceMetrics({ clarity: 0, specificity: 0, effectiveness: 0, cost: 0 });
    toast.success('Prompt cleared');
  };

  // Format text
  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = prompt.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newPrompt = prompt.substring(0, start) + formattedText + prompt.substring(end);
    setPrompt(newPrompt);
  };

  useEffect(() => {
    if (prompt.length > 50) {
      analyzePrompt();
    }
  }, [prompt]);

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : "bg-background"
    )}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Prompt Editor
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, optimize, and test prompts with AI-powered assistance
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Status indicators */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    hasUnsavedChanges ? "bg-yellow-500" : "bg-green-500"
                  )} />
                  {hasUnsavedChanges ? "Unsaved" : "Saved"}
                </div>
                <div className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  {wordCount} words
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {charCount} chars
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => document.getElementById('upload-input')?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleClear} className="text-destructive">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  id="upload-input"
                  type="file"
                  accept=".txt,.md"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-600" />
                    Prompt Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateSuggestions}
                      disabled={isGenerating || !prompt.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'AI Assist'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTest}
                      disabled={!prompt.trim()}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving || !prompt.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Formatting toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('bold')}
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('italic')}
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('code')}
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('quote')}
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText('list')}
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Link"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here... Use natural language and be specific about what you want the AI to do."
                    className={cn(
                      "min-h-[400px] resize-none text-base leading-relaxed font-mono",
                      settings.showLineNumbers && "pl-12"
                    )}
                    style={{
                      fontFamily: settings.showLineNumbers ? 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' : 'inherit'
                    }}
                  />
                  
                  {/* AI Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-medium">AI Suggestions</h4>
                      </div>
                      <div className="space-y-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <div 
                            key={index}
                            className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity</span>
                      <span className="font-medium">{performanceMetrics.clarity}%</span>
                    </div>
                    <Progress value={performanceMetrics.clarity} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Specificity</span>
                      <span className="font-medium">{performanceMetrics.specificity}%</span>
                    </div>
                    <Progress value={performanceMetrics.specificity} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Effectiveness</span>
                      <span className="font-medium">{performanceMetrics.effectiveness}%</span>
                    </div>
                    <Progress value={performanceMetrics.effectiveness} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Cost</span>
                      <span className="font-medium">${performanceMetrics.cost.toFixed(4)}</span>
                    </div>
                    <Progress value={Math.min(performanceMetrics.cost * 100, 100)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            {showSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-purple-600" />
                    Editor Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Model Settings */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">AI Model Settings</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <select
                          id="model"
                          value={settings.model}
                          onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                          <option value="claude-3-haiku">Claude 3 Haiku</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="temperature">Temperature</Label>
                          <span className="text-sm text-muted-foreground">{settings.temperature}</span>
                        </div>
                        <Slider
                          id="temperature"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[settings.temperature]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, temperature: value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="topP">Top P</Label>
                          <span className="text-sm text-muted-foreground">{settings.topP}</span>
                        </div>
                        <Slider
                          id="topP"
                          min={0}
                          max={1}
                          step={0.1}
                          value={[settings.topP]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, topP: value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="maxTokens">Max Tokens</Label>
                          <span className="text-sm text-muted-foreground">{settings.maxTokens}</span>
                        </div>
                        <Slider
                          id="maxTokens"
                          min={100}
                          max={4000}
                          step={100}
                          value={[settings.maxTokens]}
                          onValueChange={([value]) => setSettings(prev => ({ ...prev, maxTokens: value }))}
                        />
                      </div>
                    </div>

                    {/* Editor Settings */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Editor Settings</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="autoSave">Auto Save</Label>
                          <Switch
                            id="autoSave"
                            checked={settings.autoSave}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="wordWrap">Word Wrap</Label>
                          <Switch
                            id="wordWrap"
                            checked={settings.wordWrap}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, wordWrap: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="showLineNumbers">Show Line Numbers</Label>
                          <Switch
                            id="showLineNumbers"
                            checked={settings.showLineNumbers}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLineNumbers: checked }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="theme">Theme</Label>
                          <select
                            id="theme"
                            value={settings.theme}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="auto">Auto</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}</span>
                      <span>Auto-save: {settings.autoSave ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('templates')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Load Template
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={generateSuggestions}
                  disabled={isGenerating || !prompt.trim()}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Optimizing...' : 'Optimize with AI'}
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setPrompt(prev => prev + '\n\nExamples:\n1. Example 1\n2. Example 2')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Add Examples
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => toast.info('Collaboration features coming soon!')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Collaborate
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Be specific about the desired output format and include examples for better results.
                    </p>
                  </div>
                  {performanceMetrics.clarity < 70 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        🎯 <strong>Optimization:</strong> Your prompt could benefit from more specific instructions.
                      </p>
                    </div>
                  )}
                  {performanceMetrics.cost > 0.5 && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        💰 <strong>Cost Alert:</strong> Consider shortening your prompt to reduce API costs.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((performanceMetrics.clarity + performanceMetrics.specificity + performanceMetrics.effectiveness) / 3)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Word Count</span>
                      <span className="font-medium">{wordCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Character Count</span>
                      <span className="font-medium">{charCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Estimated Cost</span>
                      <span className="font-medium">${performanceMetrics.cost.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastSaved && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prompt saved</p>
                        <p className="text-xs text-muted-foreground">
                          {lastSaved.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {aiSuggestions.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI suggestions generated</p>
                        <p className="text-xs text-muted-foreground">
                          {aiSuggestions.length} suggestions
                        </p>
                      </div>
                    </div>
                  )}
                  {performanceMetrics.clarity > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Performance analyzed</p>
                        <p className="text-xs text-muted-foreground">
                          {performanceMetrics.clarity}% clarity
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
