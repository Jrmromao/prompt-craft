import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIService } from '@/lib/services/aiService';
import { MetricsService } from '@/lib/services/metricsService';

// Export dynamic configuration
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('Test API route called');
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { content, testInput, promptVersionId, temperature = 0.7, maxTokens = 1000 } = body;

    if (!content) {
      console.log('Missing content');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = AIService.getInstance();
    console.log('AI service initialized');

    // Test the prompt
    console.log('Testing prompt...');
    const result = await aiService.generateText(content, {
      temperature,
      maxTokens,
    });
    console.log('Test completed');

    // Track usage using metrics service
    const metricsService = MetricsService.getInstance();
    await metricsService.trackUsage({
      userId,
      type: 'PROMPT_TEST',
      tokenCount: result.tokenCount,
      metadata: {
        promptLength: content.length,
        temperature,
        maxTokens,
        model: result.model,
      },
    });

    return NextResponse.json({
      result: result.text,
      metadata: {
        temperature,
        maxTokens,
        tokenCount: result.tokenCount,
        model: result.model,
      },
    });
  } catch (error) {
    console.error('Error testing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to test prompt' },
      { status: 500 }
    );
  }
}