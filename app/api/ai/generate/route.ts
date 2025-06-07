import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { AIService } from '@/lib/services/aiService';
import { CreditService } from '@/lib/services/creditService';
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';

// Export dynamic configuration
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;

// Define the main handler
async function generateHandler(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, model, temperature, maxTokens } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Call AI service
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || 0.7,
        max_tokens: maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Define fallback data
const fallbackData = {
  error: 'This endpoint is only available at runtime',
};

// Export the wrapped handler
export const POST = withDynamicRoute(generateHandler, fallbackData);
