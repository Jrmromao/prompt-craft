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
  llm: LLMType;               // Selected language model
  
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

export type LLMType =
  | 'gpt-3.5-turbo'
  | 'deepseek-coder-33b'
  | 'deepseek-chat'
  | 'deepseek-coder-6.7b'

export interface LLMOption {
  value: LLMType;
  label: string;
  description: string;
  provider: string;
  category: 'enterprise' | 'standard' | 'open-source';
  capabilities: string[];
  creditCost: {
    input: number;  // Credits per 1K input tokens
    output: number; // Credits per 1K output tokens
  };
}

export const AVAILABLE_LLMS: LLMOption[] = [
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    description: 'Efficient model for most tasks with fast response times',
    provider: 'OpenAI',
    category: 'standard',
    capabilities: ['General purpose', 'Fast response', 'Cost-effective', 'Wide knowledge'],
    creditCost: {
      input: 5,
      output: 10
    }
  },
  {
    value: 'deepseek-coder-33b',
    label: 'DeepSeek Coder 33B',
    description: 'Most powerful coding model for complex programming tasks and system design',
    provider: 'DeepSeek',
    category: 'enterprise',
    capabilities: ['Complex code generation', 'System design', 'Code optimization', 'Advanced debugging'],
    creditCost: {
      input: 25,
      output: 50
    }
  },
  {
    value: 'deepseek-chat',
    label: 'DeepSeek Chat',
    description: 'Balanced model for both general tasks and coding assistance',
    provider: 'DeepSeek',
    category: 'standard',
    capabilities: ['General purpose', 'Code assistance', 'Technical writing', 'Analysis'],
    creditCost: {
      input: 12,
      output: 24
    }
  },
  {
    value: 'deepseek-coder-6.7b',
    label: 'DeepSeek Coder 6.7B',
    description: 'Efficient coding model for quick programming tasks and basic assistance',
    provider: 'DeepSeek',
    category: 'standard',
    capabilities: ['Quick code generation', 'Basic debugging', 'Code completion', 'Simple refactoring'],
    creditCost: {
      input: 8,
      output: 16
    }
  },
  // {
  //   value: 'custom',
  //   label: 'Custom Model',
  //   description: 'Configure your own model settings and parameters',
  //   provider: 'Custom',
  //   category: 'standard',
  //   capabilities: ['Customizable', 'Flexible', 'Adaptable', 'Specialized'],
  //   creditCost: {
  //     input: 0,
  //     output: 0
  //   }
  // }
];
