import { prisma } from '@/lib/prisma';

interface ModelCapability {
  model: string;
  costPer1M: number;
  qualityScore: number;
  strengths: string[];
  weaknesses: string[];
  complexityThreshold: number;
}

interface RoutingDecision {
  selectedModel: string;
  originalModel: string;
  confidence: number;
  reasoning: string;
  expectedSavings: number;
  qualityRisk: 'low' | 'medium' | 'high';
}

export class QualityAwareRouter {
  private static models: ModelCapability[] = [
    {
      model: 'gpt-4o',
      costPer1M: 6.25,
      qualityScore: 95,
      strengths: ['reasoning', 'complex_tasks', 'code', 'analysis'],
      weaknesses: [],
      complexityThreshold: 0.8
    },
    {
      model: 'claude-3.5-sonnet',
      costPer1M: 3.00,
      qualityScore: 93,
      strengths: ['writing', 'analysis', 'reasoning', 'code'],
      weaknesses: ['math'],
      complexityThreshold: 0.7
    },
    {
      model: 'gpt-4-turbo',
      costPer1M: 20.00,
      qualityScore: 90,
      strengths: ['reasoning', 'complex_tasks'],
      weaknesses: ['cost'],
      complexityThreshold: 0.9
    },
    {
      model: 'gemini-1.5-flash',
      costPer1M: 1.00,
      qualityScore: 80,
      strengths: ['speed', 'simple_tasks', 'cost'],
      weaknesses: ['complex_reasoning'],
      complexityThreshold: 0.4
    },
    {
      model: 'deepseek-chat',
      costPer1M: 0.35,
      qualityScore: 75,
      strengths: ['cost', 'simple_tasks', 'basic_code'],
      weaknesses: ['complex_reasoning', 'nuanced_tasks'],
      complexityThreshold: 0.3
    }
  ];

  static async route(
    requestedModel: string,
    messages: any[],
    userId?: string
  ): Promise<RoutingDecision> {
    // Analyze prompt complexity and requirements
    const analysis = this.analyzePrompt(messages);
    
    // Get user's quality preferences and history
    const userPrefs = await this.getUserPreferences(userId);
    
    // Find suitable models based on complexity and quality requirements
    const candidates = this.findCandidates(requestedModel, analysis, userPrefs);
    
    // Select best model balancing cost and quality
    const selected = this.selectOptimalModel(candidates, analysis);
    
    return selected;
  }

  private static analyzePrompt(messages: any[]): {
    complexity: number;
    taskType: string[];
    requiresReasoning: boolean;
    requiresCreativity: boolean;
    requiresAccuracy: boolean;
    tokenCount: number;
  } {
    const fullText = messages.map(m => m.content).join(' ').toLowerCase();
    const tokenCount = Math.ceil(fullText.length / 4);
    
    // Detect task types
    const taskTypes = [];
    if (/code|programming|function|debug|algorithm/.test(fullText)) taskTypes.push('code');
    if (/write|creative|story|poem|article/.test(fullText)) taskTypes.push('writing');
    if (/analyze|compare|evaluate|assess|reason/.test(fullText)) taskTypes.push('analysis');
    if (/math|calculate|solve|equation|formula/.test(fullText)) taskTypes.push('math');
    if (/translate|language/.test(fullText)) taskTypes.push('translation');
    if (/simple|basic|quick|straightforward/.test(fullText)) taskTypes.push('simple');
    
    // Calculate complexity score (0-1)
    let complexity = 0.3; // Base complexity
    
    // Length factor
    if (tokenCount > 1000) complexity += 0.3;
    else if (tokenCount > 500) complexity += 0.2;
    else if (tokenCount > 100) complexity += 0.1;
    
    // Task complexity
    if (taskTypes.includes('code') && /complex|advanced|optimization/.test(fullText)) complexity += 0.3;
    if (taskTypes.includes('analysis') && /deep|thorough|comprehensive/.test(fullText)) complexity += 0.3;
    if (taskTypes.includes('math') && /proof|theorem|advanced/.test(fullText)) complexity += 0.4;
    if (/multi-step|chain of thought|step by step/.test(fullText)) complexity += 0.2;
    
    // Simplicity indicators
    if (taskTypes.includes('simple') || /basic|easy|quick/.test(fullText)) complexity -= 0.2;
    
    complexity = Math.max(0, Math.min(1, complexity));
    
    return {
      complexity,
      taskType: taskTypes,
      requiresReasoning: /reason|think|analyze|logic|because|therefore/.test(fullText),
      requiresCreativity: /creative|original|innovative|imagine/.test(fullText),
      requiresAccuracy: /accurate|precise|exact|correct|important/.test(fullText),
      tokenCount
    };
  }

  private static async getUserPreferences(userId?: string) {
    if (!userId) return { qualityThreshold: 0.8, maxCostIncrease: 2.0 };
    
    try {
      // Get user's routing feedback history
      const feedback = await prisma.routingFeedback.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      
      // Calculate user's quality tolerance
      const avgRating = feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.qualityRating, 0) / feedback.length
        : 4.0;
      
      // Users with high standards get higher thresholds
      const qualityThreshold = avgRating >= 4.5 ? 0.9 : avgRating >= 4.0 ? 0.8 : 0.7;
      
      return {
        qualityThreshold,
        maxCostIncrease: avgRating >= 4.5 ? 3.0 : 2.0,
        preferredModels: feedback
          .filter(f => f.qualityRating >= 4)
          .map(f => f.selectedModel)
      };
    } catch (error) {
      return { qualityThreshold: 0.8, maxCostIncrease: 2.0 };
    }
  }

  private static findCandidates(
    requestedModel: string,
    analysis: any,
    userPrefs: any
  ): ModelCapability[] {
    const requestedModelData = this.models.find(m => m.model === requestedModel);
    if (!requestedModelData) return this.models;
    
    return this.models.filter(model => {
      // Must meet complexity threshold
      if (analysis.complexity > model.complexityThreshold) return false;
      
      // Must meet quality threshold
      if (model.qualityScore < userPrefs.qualityThreshold * 100) return false;
      
      // Check task compatibility
      if (analysis.taskType.includes('math') && model.weaknesses.includes('math')) return false;
      if (analysis.requiresReasoning && model.weaknesses.includes('complex_reasoning')) return false;
      
      // Cost constraint - don't route to more expensive models
      if (model.costPer1M > requestedModelData.costPer1M * userPrefs.maxCostIncrease) return false;
      
      return true;
    });
  }

  private static selectOptimalModel(
    candidates: ModelCapability[],
    analysis: any
  ): RoutingDecision {
    if (candidates.length === 0) {
      return {
        selectedModel: 'gpt-4o', // Safe fallback
        originalModel: 'gpt-4o',
        confidence: 0.5,
        reasoning: 'No suitable candidates found, using safe fallback',
        expectedSavings: 0,
        qualityRisk: 'low'
      };
    }
    
    // Score each candidate
    const scored = candidates.map(model => {
      let score = 0;
      
      // Quality score (40% weight)
      score += (model.qualityScore / 100) * 0.4;
      
      // Cost efficiency (30% weight) - lower cost = higher score
      const maxCost = Math.max(...candidates.map(m => m.costPer1M));
      score += (1 - (model.costPer1M / maxCost)) * 0.3;
      
      // Task compatibility (30% weight)
      let compatibility = 0.5;
      analysis.taskType.forEach((task: string) => {
        if (model.strengths.includes(task)) compatibility += 0.2;
        if (model.weaknesses.includes(task)) compatibility -= 0.3;
      });
      score += Math.max(0, Math.min(1, compatibility)) * 0.3;
      
      return { model, score };
    });
    
    // Select highest scoring model
    const best = scored.sort((a, b) => b.score - a.score)[0];
    const originalCost = candidates[0].costPer1M; // Assume first is original
    const savings = Math.max(0, originalCost - best.model.costPer1M);
    
    // Determine quality risk
    let qualityRisk: 'low' | 'medium' | 'high' = 'low';
    if (best.model.qualityScore < 85) qualityRisk = 'medium';
    if (best.model.qualityScore < 75) qualityRisk = 'high';
    
    return {
      selectedModel: best.model.model,
      originalModel: candidates[0].model,
      confidence: best.score,
      reasoning: `Selected for ${best.model.strengths.join(', ')} capabilities`,
      expectedSavings: savings,
      qualityRisk
    };
  }

  static async recordFeedback(
    userId: string,
    originalModel: string,
    selectedModel: string,
    qualityRating: number,
    wasHelpful: boolean
  ): Promise<void> {
    try {
      await prisma.routingFeedback.create({
        data: {
          userId,
          originalModel,
          selectedModel,
          qualityRating,
          wasHelpful
        }
      });
    } catch (error) {
      console.error('Failed to record routing feedback:', error);
    }
  }
}
