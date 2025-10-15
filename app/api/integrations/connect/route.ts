import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiKeyService } from '@/lib/services/apiKeyService';
import { OpenAIService } from '@/lib/services/openaiService';
import { AnthropicService } from '@/lib/services/anthropicService';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key required' },
        { status: 400 }
      );
    }

    if (!['openai', 'anthropic'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Test connection
    let isValid = false;
    if (provider === 'openai') {
      const service = new OpenAIService(apiKey);
      isValid = await service.testConnection();
    } else if (provider === 'anthropic') {
      const service = new AnthropicService(apiKey);
      isValid = await service.testConnection();
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save encrypted key
    await ApiKeyService.saveApiKey(user.id, provider, apiKey);

    return NextResponse.json({
      success: true,
      message: 'API key connected successfully',
    });
  } catch (error) {
    console.error('Connect API key error:', error);
    return NextResponse.json(
      { error: 'Failed to connect API key' },
      { status: 500 }
    );
  }
}
