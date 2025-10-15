export class PromptOptimizer {
  static async improvePrompt(prompt: string): Promise<{
    improved: string;
    changes: string[];
    score: number;
  }> {
    // Simple improvements users actually want
    let improved = prompt;
    const changes: string[] = [];
    let score = 20; // Base score

    // Add role if missing
    if (!prompt.toLowerCase().includes('you are') && !prompt.toLowerCase().includes('act as')) {
      improved = `You are an expert assistant. ${improved}`;
      changes.push('Added expert role');
      score += 20;
    } else {
      score += 20; // Already has role
    }

    // Add output format
    if (!prompt.toLowerCase().includes('format') && !prompt.toLowerCase().includes('structure')) {
      improved += '\n\nProvide a clear, structured response.';
      changes.push('Added output format');
      score += 15;
    } else {
      score += 15; // Already has format
    }

    // Add specificity
    if (prompt.length < 100) {
      improved += ' Be specific and detailed in your response.';
      changes.push('Added specificity instruction');
      score += 15;
    } else {
      score += 15; // Already detailed
    }

    // Length bonus
    if (prompt.length > 50 && prompt.length < 500) {
      score += 20;
    } else if (prompt.length >= 500) {
      score += 10;
    }

    // Quality indicators
    if (prompt.includes('example') || prompt.includes('format')) {
      score += 10;
    }

    return { 
      improved, 
      changes, 
      score: Math.min(score, 100) 
    };
  }

  static getQuickTemplates() {
    return {
      'marketing-copy': {
        name: 'Marketing Copy',
        template: 'Write compelling marketing copy for [PRODUCT]. Target audience: [AUDIENCE]. Focus on benefits, not features. Include a strong call-to-action. Tone: [TONE].',
        variables: ['PRODUCT', 'AUDIENCE', 'TONE']
      },
      'email-writer': {
        name: 'Email Writer', 
        template: 'Write a professional email about [TOPIC]. Recipient: [RECIPIENT]. Purpose: [PURPOSE]. Tone should be [TONE]. Keep it concise and actionable.',
        variables: ['TOPIC', 'RECIPIENT', 'PURPOSE', 'TONE']
      },
      'content-creator': {
        name: 'Content Creator',
        template: 'Create engaging content about [TOPIC] for [PLATFORM]. Target audience: [AUDIENCE]. Include hooks, value, and engagement elements. Length: [LENGTH].',
        variables: ['TOPIC', 'PLATFORM', 'AUDIENCE', 'LENGTH']
      },
      'code-helper': {
        name: 'Code Helper',
        template: 'Help me with [LANGUAGE] code for [TASK]. Provide working code with comments. Include error handling and best practices. Explain the solution briefly.',
        variables: ['LANGUAGE', 'TASK']
      }
    };
  }
}
