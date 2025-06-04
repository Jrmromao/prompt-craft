import { z } from 'zod';

// Prompt creation/update validation schema
export const promptSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10000 characters'),
  
  promptType: z.enum(['CHAT', 'COMPLETION', 'IMAGE']),
  
  isPublic: z.boolean(),
  
  metadata: z.record(z.unknown()).optional(),
});

// Prompt search validation schema
export const promptSearchSchema = z.object({
  query: z.string()
    .min(1, 'Search query must not be empty')
    .max(100, 'Search query must be less than 100 characters'),
  
  type: z.enum(['CHAT', 'COMPLETION', 'IMAGE']).optional(),
  
  sortBy: z.enum(['recent', 'popular', 'rating']).optional(),
  
  page: z.number().int().min(1).optional(),
  
  limit: z.number().int().min(1).max(50).optional(),
});

// Prompt review validation schema
export const promptReviewSchema = z.object({
  promptId: z.string().uuid(),
  
  status: z.enum(['APPROVED', 'REJECTED']),
  
  feedback: z.string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(500, 'Feedback must be less than 500 characters')
    .optional(),
});

// Types
export type PromptInput = z.infer<typeof promptSchema>;
export type PromptSearchInput = z.infer<typeof promptSearchSchema>;
export type PromptReviewInput = z.infer<typeof promptReviewSchema>;

// Validation functions
export const validatePrompt = (data: unknown): PromptInput => {
  return promptSchema.parse(data);
};

export const validatePromptSearch = (data: unknown): PromptSearchInput => {
  return promptSearchSchema.parse(data);
};

export const validatePromptReview = (data: unknown): PromptReviewInput => {
  return promptReviewSchema.parse(data);
}; 