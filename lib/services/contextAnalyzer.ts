interface ContextQuality {
  score: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
}

export class ContextAnalyzer {
  static analyzePrompt(prompt: string): ContextQuality {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const strengths: string[] = [];
    let score = 0;

    // Check for clear instructions
    if (prompt.includes('You are') || prompt.includes('Act as')) {
      strengths.push('Clear role definition');
      score += 20;
    } else {
      issues.push('Missing role definition');
      suggestions.push('Add "You are..." or "Act as..." to define the AI\'s role');
    }

    // Check for context setting
    if (prompt.includes('Context:') || prompt.includes('Background:')) {
      strengths.push('Explicit context provided');
      score += 15;
    } else {
      suggestions.push('Add context section to provide background information');
    }

    // Check for output format specification
    if (prompt.includes('format') || prompt.includes('structure') || prompt.includes('Output:')) {
      strengths.push('Output format specified');
      score += 15;
    } else {
      suggestions.push('Specify desired output format or structure');
    }

    // Check for examples
    if (prompt.includes('Example:') || prompt.includes('For instance:')) {
      strengths.push('Examples provided');
      score += 10;
    } else {
      suggestions.push('Add examples to clarify expectations');
    }

    // Check for constraints
    if (prompt.includes('Don\'t') || prompt.includes('Avoid') || prompt.includes('Must not')) {
      strengths.push('Clear constraints defined');
      score += 10;
    }

    // Check prompt length
    if (prompt.length < 50) {
      issues.push('Prompt too short - may lack necessary context');
    } else if (prompt.length > 2000) {
      issues.push('Prompt very long - may confuse the AI');
    } else {
      score += 10;
    }

    // Check for specific instructions
    const actionWords = ['analyze', 'create', 'write', 'generate', 'explain', 'summarize'];
    if (actionWords.some(word => prompt.toLowerCase().includes(word))) {
      strengths.push('Clear action specified');
      score += 10;
    } else {
      suggestions.push('Use specific action verbs (analyze, create, write, etc.)');
    }

    // Check for audience specification
    if (prompt.includes('audience') || prompt.includes('for beginners') || prompt.includes('expert')) {
      strengths.push('Target audience specified');
      score += 10;
    } else {
      suggestions.push('Specify target audience level');
    }

    return {
      score: Math.min(score, 100),
      issues,
      suggestions,
      strengths
    };
  }

  static generateImprovements(prompt: string): string[] {
    const analysis = this.analyzePrompt(prompt);
    const improvements: string[] = [];

    if (analysis.score < 60) {
      improvements.push('Add clear role definition at the beginning');
      improvements.push('Provide specific context and background');
      improvements.push('Define expected output format');
    }

    if (analysis.score < 80) {
      improvements.push('Include relevant examples');
      improvements.push('Add constraints and guidelines');
      improvements.push('Specify target audience');
    }

    return improvements;
  }
}
