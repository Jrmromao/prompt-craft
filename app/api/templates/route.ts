import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, this would fetch from a database
    const templates = [
      {
        id: '1',
        title: 'Code Review Assistant',
        description: 'Get detailed code reviews with specific improvement suggestions',
        category: 'engineering',
        prompt: 'Review the following code and provide detailed feedback on:\n1. Code quality and best practices\n2. Performance optimizations\n3. Security considerations\n4. Readability improvements\n\nCode: {code}',
        tags: ['code', 'review', 'quality', 'best-practices'],
        difficulty: 'intermediate',
        popularity: 95,
        rating: 4.8,
        uses: 1250,
        author: 'TechCorp',
        createdAt: '2024-01-15',
        isPremium: false,
        variables: ['code']
      },
      {
        id: '2',
        title: 'Marketing Copy Generator',
        description: 'Create compelling marketing copy for any product or service',
        category: 'marketing',
        prompt: 'Create engaging marketing copy for {product} targeting {audience}. Include:\n- Attention-grabbing headline\n- Key benefits and features\n- Call-to-action\n- Emotional appeal\n\nProduct: {product}\nTarget Audience: {audience}',
        tags: ['marketing', 'copy', 'sales', 'conversion'],
        difficulty: 'beginner',
        popularity: 88,
        rating: 4.6,
        uses: 2100,
        author: 'MarketingPro',
        createdAt: '2024-01-10',
        isPremium: false,
        variables: ['product', 'audience']
      },
      {
        id: '3',
        title: 'Data Analysis Report',
        description: 'Generate comprehensive data analysis reports with insights',
        category: 'analysis',
        prompt: 'Analyze the following dataset and create a comprehensive report:\n\n1. Executive Summary\n2. Key Findings\n3. Trends and Patterns\n4. Recommendations\n5. Visualizations needed\n\nData: {data}\nContext: {context}',
        tags: ['data', 'analysis', 'report', 'insights'],
        difficulty: 'advanced',
        popularity: 76,
        rating: 4.9,
        uses: 890,
        author: 'DataExpert',
        createdAt: '2024-01-20',
        isPremium: true,
        variables: ['data', 'context']
      },
      {
        id: '4',
        title: 'Creative Story Generator',
        description: 'Generate creative stories with specific themes and characters',
        category: 'creative',
        prompt: 'Write a creative story with the following elements:\n- Genre: {genre}\n- Main character: {character}\n- Setting: {setting}\n- Theme: {theme}\n- Length: {length}\n\nMake it engaging and original.',
        tags: ['creative', 'story', 'writing', 'fiction'],
        difficulty: 'beginner',
        popularity: 92,
        rating: 4.7,
        uses: 3400,
        author: 'CreativeWriter',
        createdAt: '2024-01-05',
        isPremium: false,
        variables: ['genre', 'character', 'setting', 'theme', 'length']
      },
      {
        id: '5',
        title: 'Technical Documentation',
        description: 'Generate comprehensive technical documentation for APIs and systems',
        category: 'technical',
        prompt: 'Create technical documentation for {system} including:\n\n1. Overview and Architecture\n2. API Endpoints\n3. Authentication\n4. Error Handling\n5. Examples and Use Cases\n6. Troubleshooting\n\nSystem: {system}\nAPI Details: {apiDetails}',
        tags: ['technical', 'documentation', 'api', 'developer'],
        difficulty: 'advanced',
        popularity: 83,
        rating: 4.8,
        uses: 1560,
        author: 'DevDocs',
        createdAt: '2024-01-12',
        isPremium: true,
        variables: ['system', 'apiDetails']
      },
      {
        id: '6',
        title: 'Email Template Generator',
        description: 'Create professional email templates for various business purposes',
        category: 'business',
        prompt: 'Create a professional email template for {purpose} with the following requirements:\n- Tone: {tone}\n- Recipient: {recipient}\n- Key points: {keyPoints}\n- Call to action: {cta}\n\nMake it clear, concise, and professional.',
        tags: ['email', 'business', 'communication', 'professional'],
        difficulty: 'beginner',
        popularity: 79,
        rating: 4.5,
        uses: 1800,
        author: 'BusinessPro',
        createdAt: '2024-01-08',
        isPremium: false,
        variables: ['purpose', 'tone', 'recipient', 'keyPoints', 'cta']
      },
      {
        id: '7',
        title: 'SQL Query Generator',
        description: 'Generate complex SQL queries with proper optimization',
        category: 'technical',
        prompt: 'Generate a SQL query for the following requirements:\n- Database: {database}\n- Tables: {tables}\n- Operations: {operations}\n- Conditions: {conditions}\n- Joins: {joins}\n- Ordering: {ordering}\n\nInclude comments and optimization suggestions.',
        tags: ['sql', 'database', 'query', 'optimization'],
        difficulty: 'advanced',
        popularity: 71,
        rating: 4.7,
        uses: 1200,
        author: 'DataEngineer',
        createdAt: '2024-01-18',
        isPremium: true,
        variables: ['database', 'tables', 'operations', 'conditions', 'joins', 'ordering']
      },
      {
        id: '8',
        title: 'Content Strategy Planner',
        description: 'Develop comprehensive content strategies for digital marketing',
        category: 'marketing',
        prompt: 'Create a content strategy for {brand} targeting {audience} with the following goals:\n- Primary goal: {primaryGoal}\n- Content types: {contentTypes}\n- Platforms: {platforms}\n- Timeline: {timeline}\n\nInclude content calendar, key themes, and success metrics.',
        tags: ['content', 'strategy', 'marketing', 'planning'],
        difficulty: 'intermediate',
        popularity: 85,
        rating: 4.6,
        uses: 1950,
        author: 'ContentMaster',
        createdAt: '2024-01-14',
        isPremium: false,
        variables: ['brand', 'audience', 'primaryGoal', 'contentTypes', 'platforms', 'timeline']
      }
    ];

    return NextResponse.json({ 
      templates,
      total: templates.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}