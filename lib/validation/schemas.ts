import { z } from 'zod';

export const trackRunSchema = z.object({
  promptId: z.string().min(1).max(100),
  model: z.string().min(1).max(50),
  provider: z.enum(['openai', 'anthropic', 'deepseek', 'gemini', 'grok']),
  input: z.string().max(50000),
  output: z.string().max(50000),
  tokensUsed: z.number().int().min(0).max(1000000),
  latency: z.number().int().min(0).max(300000),
  success: z.boolean(),
  error: z.string().optional(),
});

export const createAlertSchema = z.object({
  type: z.enum(['COST_SPIKE', 'HIGH_ERROR_RATE', 'SLOW_RESPONSE', 'USAGE_LIMIT']),
  threshold: z.number().positive().max(100000),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const exportSchema = z.object({
  format: z.enum(['csv', 'json', 'report']).optional(),
  days: z.number().int().min(1).max(365).optional(),
});
