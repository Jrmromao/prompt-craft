export type PromptType = 
  | 'content-creation'    // For creating various types of content
  | 'code-generation'     // For generating code and software solutions
  | 'data-analysis'       // For analyzing and processing data
  | 'creative-writing'    // For creative content like stories, poems, etc.
  | 'business'           // For business-related content
  | 'education'          // For educational content
  | 'technical'          // For technical documentation and guides
  | 'research'           // For research and analysis
  | 'custom';            // For custom purposes

export interface PromptPayload {
  name?: string;
  description?: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
  
  // Core prompt engineering fields
  systemPrompt?: string;        // System-level instructions
  context?: string;            // Additional context for the AI
  examples?: string[];         // Few-shot examples
  constraints?: string[];      // Constraints and limitations
  outputFormat?: string;       // Expected output format
  
  // Prompt type specific fields
  promptType: PromptType;
  
  // Content-specific fields
  tone?: string;
  format?: string;
  wordCount?: string;
  targetAudience?: string;
  includeExamples?: boolean;
  includeKeywords?: boolean;
  includeStructure?: boolean;
  
  // Advanced AI/ML fields
  temperature?: number;        // Control randomness (0-1)
  topP?: number;              // Nucleus sampling parameter
  frequencyPenalty?: number;  // Penalize frequent tokens
  presencePenalty?: number;   // Penalize repeated tokens
  maxTokens?: number;         // Maximum response length
  stopSequences?: string[];   // Stop generation at these sequences
  
  // Quality control
  validationRules?: string[]; // Rules for validating output
  fallbackStrategy?: string;  // What to do if primary approach fails
  
  // Metadata
  version?: string;           // Prompt version
  lastUpdated?: Date;         // Last modification date
  author?: string;            // Prompt author
  source?: string;            // Source of inspiration
}
