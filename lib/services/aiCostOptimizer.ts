import OpenAI from 'openai';

export class AICostOptimizer {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  async optimizePrompt(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Optimize this prompt to be more concise while maintaining its intent.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const optimized = response.choices[0]?.message?.content || prompt;
    
    return {
      original: prompt,
      optimized,
      originalTokens: Math.ceil(prompt.length / 4),
      optimizedTokens: Math.ceil(optimized.length / 4),
      tokensSaved: Math.max(0, Math.ceil(prompt.length / 4) - Math.ceil(optimized.length / 4)),
    };
  }

  analyzePrompt(prompt: string) {
    const issues = [];
    let potentialSavings = 0;

    if (prompt.includes('You are a helpful assistant')) {
      issues.push('generic_system_prompt');
      potentialSavings += 5;
    }

    if (/please|kindly|thank you/i.test(prompt)) {
      issues.push('politeness_words');
      potentialSavings += 3;
    }

    if (prompt.length > 500) {
      issues.push('long_prompt');
      potentialSavings += 10;
    }

    return { issues, potentialSavings };
  }

  async batchOptimize(prompts: string[]) {
    return Promise.all(prompts.map(p => this.optimizePrompt(p)));
  }

  scoreOptimization(original: string, optimized: string) {
    if (!optimized || optimized.length === 0) return 0;
    
    const reduction = (original.length - optimized.length) / original.length;
    return Math.max(0, Math.min(100, reduction * 100));
  }
}
