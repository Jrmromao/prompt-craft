export type PromptType = 'text' | 'image' | 'video' | 'music' | 'software' | 'medical';

export interface PromptPayload {
  name?: string;
  description?: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
  tone?: string;
  format?: string;
  wordCount?: string;
  targetAudience?: string;
  includeExamples?: boolean;
  includeKeywords?: boolean;
  includeStructure?: boolean;
  promptType: PromptType;
  style?: string;
  resolution?: string;
  palette?: string;
  duration?: string;
  genre?: string;
  mood?: string;
  length?: string;
  instruments?: string;
}
