import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { CreatePromptDialog } from '@/components/prompts/CreatePromptDialog';
import { PromptType } from '@/types/ai';

interface Prompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isPublic: boolean;
  promptType: string;
  metadata: any | null;
  tags: { id: string; name: string }[];
  createdAt: Date;
  userId: string;
}

interface PromptManagerProps {
  prompts: Prompt[];
  isLoading: boolean;
  onSave: (prompt: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, prompt: any) => Promise<void>;
  mode?: 'full' | 'create';
  currentUserId?: string;
}

export function PromptManager({
  prompts,
  isLoading,
  onSave,
  onDelete,
  onEdit,
  mode = 'full',
  currentUserId,
}: PromptManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [content, setContent] = React.useState('');
  const [isPublic, setIsPublic] = React.useState(false);
  const [promptType, setPromptType] = React.useState<
    'text' | 'image' | 'video' | 'music' | 'software'
  >('text');
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  
  // New metadata state
  const [systemPrompt, setSystemPrompt] = React.useState('');
  const [context, setContext] = React.useState('');
  const [examples, setExamples] = React.useState<string[]>([]);
  const [constraints, setConstraints] = React.useState<string[]>([]);
  const [outputFormat, setOutputFormat] = React.useState('');
  const [temperature, setTemperature] = React.useState(0.7);
  const [topP, setTopP] = React.useState(1);
  const [frequencyPenalty, setFrequencyPenalty] = React.useState(0);
  const [presencePenalty, setPresencePenalty] = React.useState(0);
  const [maxTokens, setMaxTokens] = React.useState<number | undefined>();
  const [validationRules, setValidationRules] = React.useState<string[]>([]);
  const [fallbackStrategy, setFallbackStrategy] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Prompt name is required', variant: 'destructive' });
      return;
    }
    if (!content.trim()) {
      toast({ title: 'Prompt content is required', variant: 'destructive' });
      return;
    }
    try {
      const metadata = {
        systemPrompt,
        context,
        examples,
        constraints,
        outputFormat,
        temperature,
        topP,
        frequencyPenalty,
        presencePenalty,
        maxTokens,
        validationRules,
        fallbackStrategy,
      };

      if (editingPrompt) {
        await onEdit(editingPrompt.id, {
          name,
          description,
          content,
          isPublic,
          promptType,
          tags: (tags || []).map(tag => ({ id: '', name: tag })),
          metadata,
        });
        toast({ title: 'Prompt updated successfully!' });
      } else {
        await onSave({
          name,
          description,
          content,
          isPublic,
          promptType,
          tags,
          metadata,
        });
        toast({ title: 'Prompt created successfully!' });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error saving prompt',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      console.error('Error saving prompt:', error);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setName(prompt.name);
    setDescription(prompt.description || '');
    setContent(prompt.content);
    setIsPublic(prompt.isPublic);
    setPromptType(prompt.promptType as 'text' | 'image' | 'video' | 'music');
    setTags((prompt.tags || []).map(tag => tag.name));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await onDelete(id);
        toast({ title: 'Prompt deleted successfully!' });
      } catch (error) {
        toast({
          title: 'Error deleting prompt',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
        console.error('Error deleting prompt:', error);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setContent('');
    setIsPublic(false);
    setPromptType('text');
    setTags([]);
    setNewTag('');
    setEditingPrompt(null);
    // Reset metadata fields
    setSystemPrompt('');
    setContext('');
    setExamples([]);
    setConstraints([]);
    setOutputFormat('');
    setTemperature(0.7);
    setTopP(1);
    setFrequencyPenalty(0);
    setPresencePenalty(0);
    setMaxTokens(undefined);
    setValidationRules([]);
    setFallbackStrategy('');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="space-y-4">
        <CreatePromptDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          content={content}
          setContent={setContent}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          promptType={promptType as PromptType}
          setPromptType={(type: PromptType) => setPromptType(type as 'text' | 'image' | 'video' | 'music' | 'software')}
          tags={tags}
          setTags={setTags}
          newTag={newTag}
          setNewTag={setNewTag}
          addTag={addTag}
          removeTag={removeTag}
          // New metadata props
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          context={context}
          setContext={setContext}
          examples={examples}
          setExamples={setExamples}
          constraints={constraints}
          setConstraints={setConstraints}
          outputFormat={outputFormat}
          setOutputFormat={setOutputFormat}
          temperature={temperature}
          setTemperature={setTemperature}
          topP={topP}
          setTopP={setTopP}
          frequencyPenalty={frequencyPenalty}
          setFrequencyPenalty={setFrequencyPenalty}
          presencePenalty={presencePenalty}
          setPresencePenalty={setPresencePenalty}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
          validationRules={validationRules}
          setValidationRules={setValidationRules}
          fallbackStrategy={fallbackStrategy}
          setFallbackStrategy={setFallbackStrategy}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Prompts</h2>
        <Button onClick={() => setIsDialogOpen(true)}>New Prompt</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(prompts || []).map(prompt => (
          <div
            key={prompt.id}
            className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold">{prompt.name}</h3>
              {currentUserId === prompt.userId && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(prompt)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(prompt.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
            {prompt.description && (
              <p className="mt-2 text-sm text-muted-foreground">{prompt.description}</p>
            )}
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{prompt.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(prompt.tags || []).map(tag => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
              {prompt.isPublic && <Badge variant="outline">Public</Badge>}
              <Badge variant="outline">{prompt.promptType}</Badge>
            </div>
          </div>
        ))}
      </div>

      <CreatePromptDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        content={content}
        setContent={setContent}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        promptType={promptType as PromptType}
        setPromptType={(type: PromptType) => setPromptType(type as 'text' | 'image' | 'video' | 'music' | 'software')}
        tags={tags}
        setTags={setTags}
        newTag={newTag}
        setNewTag={setNewTag}
        addTag={addTag}
        removeTag={removeTag}
        // New metadata props
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        context={context}
        setContext={setContext}
        examples={examples}
        setExamples={setExamples}
        constraints={constraints}
        setConstraints={setConstraints}
        outputFormat={outputFormat}
        setOutputFormat={setOutputFormat}
        temperature={temperature}
        setTemperature={setTemperature}
        topP={topP}
        setTopP={setTopP}
        frequencyPenalty={frequencyPenalty}
        setFrequencyPenalty={setFrequencyPenalty}
        presencePenalty={presencePenalty}
        setPresencePenalty={setPresencePenalty}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        validationRules={validationRules}
        setValidationRules={setValidationRules}
        fallbackStrategy={fallbackStrategy}
        setFallbackStrategy={setFallbackStrategy}
      />
    </div>
  );
}
