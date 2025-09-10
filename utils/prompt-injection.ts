import { z } from 'zod';

// Enhanced prompt injection patterns with semantic analysis
const INJECTION_PATTERNS = [
  // Basic instruction overrides
  /ignore previous instructions/i,
  /forget all previous instructions/i,
  /disregard.*instructions/i,
  /override.*instructions/i,
  /replace.*instructions/i,
  
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
  /ignore all previous information/i,
  /ignore all information/i,
  /ignore all previous data/i,
  /ignore all data/i,
  /ignore all previous content/i,
  /ignore all content/i,
  /ignore all previous text/i,
  /ignore all text/i,
  /ignore all previous words/i,
  /ignore all words/i,
  /ignore all previous sentences/i,
  /ignore all sentences/i,
  /ignore all previous paragraphs/i,
  /ignore all paragraphs/i,
  /ignore all previous sections/i,
  /ignore all sections/i,
  /ignore all previous chapters/i,
  /ignore all chapters/i,
  /ignore all previous books/i,
  /ignore all books/i,
  /ignore all previous documents/i,
  /ignore all documents/i,
  /ignore all previous files/i,
  /ignore all files/i,
  /ignore all previous records/i,
  /ignore all records/i,
  /ignore all previous entries/i,
  /ignore all entries/i,
  /ignore all previous items/i,
  /ignore all items/i,
  /ignore all previous objects/i,
  /ignore all objects/i,
  /ignore all previous entities/i,
  /ignore all entities/i,
  /ignore all previous instances/i,
  /ignore all instances/i,
  /ignore all previous examples/i,
  /ignore all examples/i,
  /ignore all previous cases/i,
  /ignore all cases/i,
  /ignore all previous scenarios/i,
  /ignore all scenarios/i,
  /ignore all previous situations/i,
  /ignore all situations/i,
  /ignore all previous conditions/i,
  /ignore all conditions/i,
  /ignore all previous states/i,
  /ignore all states/i,
  /ignore all previous modes/i,
  /ignore all modes/i,
  /ignore all previous phases/i,
  /ignore all phases/i,
  /ignore all previous stages/i,
  /ignore all stages/i,
  /ignore all previous steps/i,
  /ignore all steps/i,
  /ignore all previous actions/i,
  /ignore all actions/i,
  /ignore all previous operations/i,
  /ignore all operations/i,
  /ignore all previous functions/i,
  /ignore all functions/i,
  /ignore all previous methods/i,
  /ignore all methods/i,
  /ignore all previous procedures/i,
  /ignore all procedures/i,
  /ignore all previous routines/i,
  /ignore all routines/i,
  /ignore all previous tasks/i,
  /ignore all tasks/i,
  /ignore all previous jobs/i,
  /ignore all jobs/i,
  /ignore all previous processes/i,
  /ignore all processes/i,
  /ignore all previous workflows/i,
  /ignore all workflows/i,
  /ignore all previous pipelines/i,
  /ignore all pipelines/i,
  /ignore all previous systems/i,
  /ignore all systems/i,
  /ignore all previous applications/i,
  /ignore all applications/i,
  /ignore all previous services/i,
  /ignore all services/i,
  /ignore all previous APIs/i,
  /ignore all APIs/i,
  /ignore all previous endpoints/i,
  /ignore all endpoints/i,
  /ignore all previous routes/i,
  /ignore all routes/i,
  /ignore all previous paths/i,
  /ignore all paths/i,
  /ignore all previous URLs/i,
  /ignore all URLs/i,
  /ignore all previous links/i,
  /ignore all links/i,
  /ignore all previous references/i,
  /ignore all references/i,
  /ignore all previous pointers/i,
  /ignore all pointers/i,
  /ignore all previous handles/i,
  /ignore all handles/i,
  /ignore all previous identifiers/i,
  /ignore all identifiers/i,
  /ignore all previous names/i,
  /ignore all names/i,
  /ignore all previous labels/i,
  /ignore all labels/i,
  /ignore all previous tags/i,
  /ignore all tags/i,
  /ignore all previous categories/i,
  /ignore all categories/i,
  /ignore all previous types/i,
  /ignore all types/i,
  /ignore all previous classes/i,
  /ignore all classes/i,
  /ignore all previous interfaces/i,
  /ignore all interfaces/i,
  /ignore all previous traits/i,
  /ignore all traits/i,
  /ignore all previous mixins/i,
  /ignore all mixins/i,
  /ignore all previous modules/i,
  /ignore all modules/i,
  /ignore all previous packages/i,
  /ignore all packages/i,
  /ignore all previous libraries/i,
  /ignore all libraries/i,
  /ignore all previous frameworks/i,
  /ignore all frameworks/i,
  /ignore all previous platforms/i,
  /ignore all platforms/i,
  /ignore all previous environments/i,
  /ignore all environments/i,
  /ignore all previous configurations/i,
  /ignore all configurations/i,
  /ignore all previous settings/i,
  /ignore all settings/i,
  /ignore all previous options/i,
  /ignore all options/i,
  /ignore all previous parameters/i,
  /ignore all parameters/i,
  /ignore all previous arguments/i,
  /ignore all arguments/i,
  /ignore all previous inputs/i,
  /ignore all inputs/i,
  /ignore all previous outputs/i,
  /ignore all outputs/i,
  /ignore all previous results/i,
  /ignore all results/i,
  /ignore all previous responses/i,
  /ignore all responses/i,
  /ignore all previous replies/i,
  /ignore all replies/i,
  /ignore all previous answers/i,
  /ignore all answers/i,
  /ignore all previous solutions/i,
  /ignore all solutions/i,
  /ignore all previous fixes/i,
  /ignore all fixes/i,
  /ignore all previous patches/i,
  /ignore all patches/i,
  /ignore all previous updates/i,
  /ignore all updates/i,
  /ignore all previous upgrades/i,
  /ignore all upgrades/i,
  /ignore all previous versions/i,
  /ignore all versions/i,
  /ignore all previous releases/i,
  /ignore all releases/i,
  /ignore all previous builds/i,
  /ignore all builds/i,
  /ignore all previous deployments/i,
  /ignore all deployments/i,
  /ignore all previous installations/i,
  /ignore all installations/i,
  /ignore all previous setups/i,
  /ignore all setups/i,
  /ignore all previous configurations/i,
  /ignore all configurations/i,
  /ignore all previous settings/i,
  /ignore all settings/i,
  /ignore all previous options/i,
  /ignore all options/i,
  /ignore all previous parameters/i,
  /ignore all parameters/i,
  /ignore all previous arguments/i,
  /ignore all arguments/i,
  /ignore all previous inputs/i,
  /ignore all inputs/i,
  /ignore all previous outputs/i,
  /ignore all outputs/i,
  /ignore all previous results/i,
  /ignore all results/i,
  /ignore all previous responses/i,
  /ignore all responses/i,
  /ignore all previous replies/i,
  /ignore all replies/i,
  /ignore all previous answers/i,
  /ignore all answers/i,
  /ignore all previous solutions/i,
  /ignore all solutions/i,
  /ignore all previous fixes/i,
  /ignore all fixes/i,
  /ignore all previous patches/i,
  /ignore all patches/i,
  /ignore all previous updates/i,
  /ignore all updates/i,
  /ignore all previous upgrades/i,
  /ignore all upgrades/i,
  /ignore all previous versions/i,
  /ignore all versions/i,
  /ignore all previous releases/i,
  /ignore all releases/i,
  /ignore all previous builds/i,
  /ignore all builds/i,
  /ignore all previous deployments/i,
  /ignore all deployments/i,
  /ignore all previous installations/i,
  /ignore all installations/i,
  /ignore all previous setups/i,
  /ignore all setups/i,
];

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
