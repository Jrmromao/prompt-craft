export function calculateCost(provider: string, model: string, tokens: number): number {
  const rates: Record<string, Record<string, number>> = {
    openai: {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
    },
    anthropic: {
      'claude-3-sonnet': 0.015,
      'claude-3-haiku': 0.001,
    },
    gemini: {
      'gemini-pro': 0.0005,
    },
  };

  const rate = rates[provider]?.[model] || 0.002;
  return (tokens / 1000) * rate;
}

export function calculateSavings(originalCost: number, optimizedCost: number): number {
  return Math.max(0, originalCost - optimizedCost);
}
