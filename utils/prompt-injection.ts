import { z } from 'zod';

// Enhanced prompt injection patterns with semantic analysis
const INJECTION_PATTERNS = [
  // Basic instruction overrides
  /ignore previous instructions/i,
  /forget all previous instructions/i,
  /disregard.*instructions/i,
  /override.*instructions/i,
  /replace.*instructions/i,
  /disregard previous instructions/i,
  /ignore the above instructions/i,
  /ignore all previous instructions/i,
  /ignore all instructions/i,
  /ignore all previous prompts/i,
  /ignore all prompts/i,
  /ignore all previous messages/i,
  /ignore all messages/i,
  /ignore all previous conversations/i,
  /ignore all conversations/i,
  /ignore all previous context/i,
  /ignore all context/i,
  
  // Role manipulation
  /you are now/i,
  /act as.*instead/i,
  /pretend to be/i,
  /roleplay as/i,
  /simulate being/i,
  
  // System prompts
  /system prompt/i,
  /system message/i,
  /initial prompt/i,
  /base prompt/i,
  
  // Jailbreaking attempts
  /DAN mode/i,
  /developer mode/i,
  /unrestricted mode/i,
  /bypass.*filter/i,
  /ignore.*safety/i,
  
  // Encoding attempts
  /base64/i,
  /hex.*decode/i,
  /rot13/i,
  /caesar.*cipher/i,
  
  // Prompt leaking
  /show.*prompt/i,
  /reveal.*instructions/i,
  /what.*your.*prompt/i,
];

// Risk scoring for different injection types
const RISK_SCORES = {
  HIGH: 10,
  MEDIUM: 5,
  LOW: 2
};

// Semantic analysis patterns
const SEMANTIC_PATTERNS = [
  { pattern: /(?:ignore|forget|disregard).*(?:previous|all).*(?:instructions|prompts)/i, risk: RISK_SCORES.HIGH },
  { pattern: /(?:you are|act as|pretend to be).*(?:now|instead)/i, risk: RISK_SCORES.HIGH },
  { pattern: /(?:system|initial|base).*(?:prompt|message)/i, risk: RISK_SCORES.MEDIUM },
  { pattern: /(?:show|reveal|display).*(?:prompt|instructions|system)/i, risk: RISK_SCORES.MEDIUM },
  { pattern: /(?:bypass|ignore).*(?:filter|safety|restriction)/i, risk: RISK_SCORES.HIGH },
];

export function analyzePromptRisk(prompt: string): { isRisky: boolean; score: number; reasons: string[] } {
  let totalScore = 0;
  const reasons: string[] = [];
  
  // Check semantic patterns
  for (const { pattern, risk } of SEMANTIC_PATTERNS) {
    if (pattern.test(prompt)) {
      totalScore += risk;
      reasons.push(`Detected: ${pattern.source}`);
    }
  }
  
  // Check for suspicious character sequences
  if (/[^\x20-\x7E]/.test(prompt)) {
    totalScore += RISK_SCORES.LOW;
    reasons.push('Contains non-ASCII characters');
  }
  
  // Check for excessive repetition (potential token stuffing)
  const words = prompt.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxRepetition = Math.max(...Object.values(wordCounts));
  if (maxRepetition > 10) {
    totalScore += RISK_SCORES.MEDIUM;
    reasons.push('Excessive word repetition detected');
  }
  
  return {
    isRisky: totalScore >= RISK_SCORES.MEDIUM,
    score: totalScore,
    reasons
  };
}



// Schema for prompt validation
const promptSchema = z.object({
  content: z.string().min(1).max(10000),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

export function validatePrompt(prompt: unknown) {
  try {
    return promptSchema.parse(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid prompt: ${error.errors.map(err => err.message).join(', ')}`);
    }
    throw error;
  }
}

export function checkForPromptInjection(prompt: string): boolean {
  const riskAnalysis = analyzePromptRisk(prompt);
  return riskAnalysis.isRisky || INJECTION_PATTERNS.some(pattern => pattern.test(prompt));
}

export function sanitizePrompt(prompt: string): string {
  // Remove any HTML tags
  let sanitized = prompt.replace(/<[^>]*>/g, '');

  // Remove any script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any JavaScript event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/g, '');

  // Remove any JavaScript URLs
  sanitized = sanitized.replace(/javascript:[^"']*/g, '');

  // Remove any data URLs
  sanitized = sanitized.replace(/data:[^"']*/g, '');

  // Remove any VBScript
  sanitized = sanitized.replace(/vbscript:[^"']*/g, '');

  // Remove any PHP code
  sanitized = sanitized.replace(/<\?php[^?]*\?>/g, '');

  // Remove any ASP code
  sanitized = sanitized.replace(/<%.*?%>/g, '');

  // Remove any SQL injection attempts
  sanitized = sanitized.replace(/['";]/g, '');

  return sanitized;
}
