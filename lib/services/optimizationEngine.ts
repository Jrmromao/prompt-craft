import { prisma } from '@/lib/prisma';

interface OptimizationSuggestion {
  type: 'cost' | 'performance' | 'quality';
  title: string;
  description: string;
  potentialSavings?: number;
  impact?: string;
  actionUrl?: string;
}

export class OptimizationEngine {
  static async generateSuggestions(userId: string): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const runs = await prisma.promptRun.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    if (runs.length === 0) return suggestions;

    // 1. Check for expensive model usage on simple tasks
    const gpt4Runs = runs.filter(r => r.model === 'gpt-4');
    const avgGpt4Tokens = gpt4Runs.reduce((sum, r) => sum + r.outputTokens, 0) / gpt4Runs.length;
    
    if (gpt4Runs.length > 20 && avgGpt4Tokens < 200) {
      const currentCost = gpt4Runs.reduce((sum, r) => sum + r.cost, 0);
      // CostCalculator removed - using estimated savings
      const gpt35Cost = currentCost * 0.1; // GPT-3.5 is ~10x cheaper
      const savings = currentCost - gpt35Cost;

      suggestions.push({
        type: 'cost',
        title: 'Switch to GPT-3.5 for simple tasks',
        description: `You're using GPT-4 for short responses (avg ${Math.round(avgGpt4Tokens)} tokens). GPT-3.5 is 90% cheaper with similar quality for simple tasks.`,
        potentialSavings: savings,
        impact: `Save $${savings.toFixed(2)}/month`,
      });
    }

    // 2. Check for low success rate prompts
    const promptGroups = new Map<string, typeof runs>();
    runs.forEach(run => {
      if (!run.promptId) return;
      const group = promptGroups.get(run.promptId) || [];
      group.push(run);
      promptGroups.set(run.promptId, group);
    });

    for (const [promptId, promptRuns] of promptGroups) {
      if (promptRuns.length < 10) continue;
      
      const successRate = promptRuns.filter(r => r.success === true).length / promptRuns.length;
      
      if (successRate < 0.6) {
        suggestions.push({
          type: 'quality',
          title: 'Improve low-performing prompt',
          description: `One of your prompts has only ${(successRate * 100).toFixed(0)}% success rate. Adding examples can improve results by 30-50%.`,
          impact: `+${Math.round((0.8 - successRate) * 100)}% success rate`,
          actionUrl: `/prompts/${promptId}`,
        });
      }
    }

    // 3. Check for high latency
    const avgLatency = runs.reduce((sum, r) => sum + r.latency, 0) / runs.length;
    if (avgLatency > 5000) {
      suggestions.push({
        type: 'performance',
        title: 'Reduce response time',
        description: `Your average response time is ${(avgLatency / 1000).toFixed(1)}s. Consider using streaming or reducing max_tokens to improve speed.`,
        impact: `-${Math.round((avgLatency - 2000) / 1000)}s response time`,
      });
    }

    return suggestions;
  }

  static async saveSuggestions(userId: string): Promise<void> {
    const suggestions = await this.generateSuggestions(userId);
    
    for (const suggestion of suggestions) {
      await prisma.optimizationSuggestion.create({
        data: {
          userId,
          type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          potentialSavings: suggestion.potentialSavings,
          impact: suggestion.impact,
          actionUrl: suggestion.actionUrl,
        },
      });
    }
  }
}
