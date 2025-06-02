export interface PromptPayload {
  name: string;
  description: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  tone?: string;
  format?: string;
  wordCount?: string;
  targetAudience?: string;
  includeExamples?: boolean;
  includeKeywords?: boolean;
  includeStructure?: boolean;
  promptType: 'text' | 'image' | 'video' | 'music';
  style?: string;
  resolution?: string;
  palette?: string;
  duration?: string;
  genre?: string;
  mood?: string;
  length?: string;
  instruments?: string;
} 