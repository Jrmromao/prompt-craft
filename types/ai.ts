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
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'gemini-pro'
  | 'mistral-large'
  | 'mistral-medium'
  | 'mistral-small'
  | 'llama-2-70b'
  | 'llama-2-13b'
  | 'llama-2-7b'
  | 'deepseek-coder-33b'
  | 'deepseek-chat'
  | 'deepseek-coder-6.7b'
  | 'custom';

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
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'Most advanced model with exceptional reasoning and complex task handling',
    provider: 'OpenAI',
    category: 'enterprise',
    capabilities: ['Complex reasoning', 'Advanced coding', 'Creative writing', 'Detailed analysis'],
    creditCost: {
      input: 30,
      output: 60
    }
  },
  {
    value: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description: 'Latest GPT-4 model with improved performance and lower latency',
    provider: 'OpenAI',
    category: 'enterprise',
    capabilities: ['Fast response', 'Cost-effective', 'Up-to-date knowledge', 'High accuracy'],
    creditCost: {
      input: 20,
      output: 40
    }
  },
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
    value: 'claude-3-opus',
    label: 'Claude 3 Opus',
    description: 'Most capable Claude model with exceptional performance across tasks',
    provider: 'Anthropic',
    category: 'enterprise',
    capabilities: ['Advanced reasoning', 'Complex analysis', 'Creative tasks', 'Technical writing'],
    creditCost: {
      input: 25,
      output: 50
    }
  },
  {
    value: 'claude-3-sonnet',
    label: 'Claude 3 Sonnet',
    description: 'Balanced Claude model with strong performance and efficiency',
    provider: 'Anthropic',
    category: 'standard',
    capabilities: ['General purpose', 'Good reasoning', 'Creative writing', 'Technical tasks'],
    creditCost: {
      input: 15,
      output: 30
    }
  },
  {
    value: 'claude-3-haiku',
    label: 'Claude 3 Haiku',
    description: 'Fast and efficient Claude model for quick tasks',
    provider: 'Anthropic',
    category: 'standard',
    capabilities: ['Quick responses', 'Basic tasks', 'Simple analysis', 'Cost-effective'],
    creditCost: {
      input: 8,
      output: 16
    }
  },
  {
    value: 'gemini-pro',
    label: 'Gemini Pro',
    description: 'Google\'s advanced AI model with strong reasoning capabilities',
    provider: 'Google',
    category: 'standard',
    capabilities: ['Multimodal', 'Strong reasoning', 'Creative tasks', 'Technical analysis'],
    creditCost: {
      input: 12,
      output: 24
    }
  },
  {
    value: 'mistral-large',
    label: 'Mistral Large',
    description: 'Most capable Mistral model with advanced reasoning',
    provider: 'Mistral AI',
    category: 'standard',
    capabilities: ['Advanced reasoning', 'Complex tasks', 'Technical writing', 'Analysis'],
    creditCost: {
      input: 18,
      output: 36
    }
  },
  {
    value: 'mistral-medium',
    label: 'Mistral Medium',
    description: 'Balanced Mistral model for general tasks',
    provider: 'Mistral AI',
    category: 'standard',
    capabilities: ['General purpose', 'Good reasoning', 'Creative writing', 'Basic analysis'],
    creditCost: {
      input: 10,
      output: 20
    }
  },
  {
    value: 'mistral-small',
    label: 'Mistral Small',
    description: 'Efficient Mistral model for quick tasks',
    provider: 'Mistral AI',
    category: 'standard',
    capabilities: ['Quick responses', 'Basic tasks', 'Simple analysis', 'Cost-effective'],
    creditCost: {
      input: 6,
      output: 12
    }
  },
  {
    value: 'llama-2-70b',
    label: 'Llama 2 70B',
    description: 'Most capable open-source model with strong performance',
    provider: 'Meta',
    category: 'open-source',
    capabilities: ['Advanced reasoning', 'Complex tasks', 'Technical writing', 'Analysis'],
    creditCost: {
      input: 15,
      output: 30
    }
  },
  {
    value: 'llama-2-13b',
    label: 'Llama 2 13B',
    description: 'Balanced open-source model for general tasks',
    provider: 'Meta',
    category: 'open-source',
    capabilities: ['General purpose', 'Good reasoning', 'Creative writing', 'Basic analysis'],
    creditCost: {
      input: 8,
      output: 16
    }
  },
  {
    value: 'llama-2-7b',
    label: 'Llama 2 7B',
    description: 'Efficient open-source model for quick tasks',
    provider: 'Meta',
    category: 'open-source',
    capabilities: ['Quick responses', 'Basic tasks', 'Simple analysis', 'Cost-effective'],
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
  {
    value: 'custom',
    label: 'Custom Model',
    description: 'Configure your own model settings and parameters',
    provider: 'Custom',
    category: 'standard',
    capabilities: ['Customizable', 'Flexible', 'Adaptable', 'Specialized'],
    creditCost: {
      input: 0,
      output: 0
    }
  }
];
