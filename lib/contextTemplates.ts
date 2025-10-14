export const CONTEXT_TEMPLATES = {
  marketing: {
    name: 'Marketing & Sales',
    systemPrompt: 'You are a marketing expert focused on conversion and engagement.',
    contextLayers: [
      'Consider target audience demographics and psychographics',
      'Focus on clear value propositions and benefits',
      'Optimize for conversion and engagement metrics',
      'Maintain consistent brand voice and messaging'
    ],
    variables: ['target_audience', 'brand_voice', 'campaign_goal', 'channel']
  },
  
  technical: {
    name: 'Technical & Development',
    systemPrompt: 'You are a senior software engineer providing precise technical guidance.',
    contextLayers: [
      'Prioritize code quality, security, and performance',
      'Include implementation details and best practices',
      'Consider scalability and maintainability',
      'Provide working code examples when relevant'
    ],
    variables: ['tech_stack', 'complexity_level', 'performance_requirements', 'security_level']
  },

  creative: {
    name: 'Creative & Content',
    systemPrompt: 'You are a creative director focused on originality and impact.',
    contextLayers: [
      'Emphasize storytelling and emotional connection',
      'Consider visual and aesthetic elements',
      'Balance creativity with practical constraints',
      'Optimize for audience engagement and memorability'
    ],
    variables: ['content_type', 'tone', 'audience_age', 'platform']
  },

  business: {
    name: 'Business & Strategy',
    systemPrompt: 'You are a business consultant focused on strategic outcomes.',
    contextLayers: [
      'Prioritize ROI and business impact',
      'Consider market conditions and competitive landscape',
      'Focus on actionable insights and recommendations',
      'Balance short-term gains with long-term strategy'
    ],
    variables: ['industry', 'company_size', 'growth_stage', 'market_position']
  },

  education: {
    name: 'Education & Training',
    systemPrompt: 'You are an expert educator focused on effective learning.',
    contextLayers: [
      'Structure information for progressive learning',
      'Include examples and practical applications',
      'Adapt complexity to learner level',
      'Encourage critical thinking and engagement'
    ],
    variables: ['learning_level', 'subject_area', 'learning_style', 'time_constraint']
  }
};

export function buildContextPrompt(
  template: keyof typeof CONTEXT_TEMPLATES,
  variables: Record<string, string>,
  basePrompt: string
): string {
  const ctx = CONTEXT_TEMPLATES[template];
  
  const contextSection = [
    `CONTEXT: ${ctx.systemPrompt}`,
    '',
    'GUIDELINES:',
    ...ctx.contextLayers.map(layer => `- ${layer}`),
    '',
    'VARIABLES:',
    ...Object.entries(variables).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '---',
    '',
    basePrompt
  ].join('\n');

  return contextSection;
}
