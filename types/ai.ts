export interface PromptPayload {
  name: string;
  description?: string;
  content: string;
  tags?: string[];
  tone?: string;
  format?: string;
  wordCount?: string;
  targetAudience?: string;
  includeExamples?: boolean;
  includeKeywords?: boolean;
  includeStructure?: boolean;
} 