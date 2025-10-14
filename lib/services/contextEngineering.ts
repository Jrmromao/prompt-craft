interface ContextLayer {
  type: 'system' | 'domain' | 'user' | 'session' | 'dynamic';
  content: string;
  priority: number;
  conditions?: string[];
}

interface ContextProfile {
  userId: string;
  domain: string;
  expertise: string;
  preferences: Record<string, any>;
  history: string[];
}

export class ContextEngineeringService {
  private static instance: ContextEngineeringService;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ContextEngineeringService();
    }
    return this.instance;
  }

  async enhancePrompt(
    basePrompt: string, 
    context: {
      userId?: string;
      promptType?: string;
      domain?: string;
      userInput?: string;
      sessionHistory?: string[];
    }
  ): Promise<string> {
    const layers = await this.buildContextLayers(context);
    return this.assemblePrompt(basePrompt, layers);
  }

  private async buildContextLayers(context: any): Promise<ContextLayer[]> {
    const layers: ContextLayer[] = [];

    // System context
    layers.push({
      type: 'system',
      content: 'You are an expert AI assistant. Provide accurate, helpful, and contextually relevant responses.',
      priority: 1
    });

    // Domain-specific context
    if (context.domain) {
      const domainContext = await this.getDomainContext(context.domain);
      layers.push({
        type: 'domain',
        content: domainContext,
        priority: 2
      });
    }

    // User context
    if (context.userId) {
      const userProfile = await this.getUserProfile(context.userId);
      layers.push({
        type: 'user',
        content: `User expertise: ${userProfile.expertise}. Preferences: ${JSON.stringify(userProfile.preferences)}`,
        priority: 3
      });
    }

    // Session context
    if (context.sessionHistory?.length) {
      layers.push({
        type: 'session',
        content: `Previous interactions: ${context.sessionHistory.slice(-3).join('\n')}`,
        priority: 4
      });
    }

    return layers.sort((a, b) => a.priority - b.priority);
  }

  private assemblePrompt(basePrompt: string, layers: ContextLayer[]): string {
    const contextSections = layers.map(layer => layer.content).join('\n\n');
    return `${contextSections}\n\n---\n\n${basePrompt}`;
  }

  private async getDomainContext(domain: string): Promise<string> {
    const domainContexts = {
      'marketing': 'Focus on conversion, engagement, and brand voice. Consider target audience demographics and marketing funnel stage.',
      'technical': 'Provide precise, implementation-focused responses. Include code examples and best practices.',
      'creative': 'Emphasize originality, storytelling, and emotional impact. Consider artistic elements and creative constraints.',
      'business': 'Focus on ROI, efficiency, and strategic outcomes. Consider market conditions and business objectives.',
      'education': 'Structure responses for learning. Include examples, explanations, and progressive difficulty.'
    };
    
    return domainContexts[domain as keyof typeof domainContexts] || 'Provide comprehensive and helpful responses.';
  }

  private async getUserProfile(userId: string): Promise<ContextProfile> {
    // In production, fetch from database
    return {
      userId,
      domain: 'general',
      expertise: 'intermediate',
      preferences: { tone: 'professional', detail: 'medium' },
      history: []
    };
  }

  async adaptiveContext(
    promptId: string,
    userFeedback: 'positive' | 'negative' | 'neutral',
    context: string
  ): Promise<void> {
    // Learn from user feedback to improve context
    // Store in database for future context enhancement
  }
}
