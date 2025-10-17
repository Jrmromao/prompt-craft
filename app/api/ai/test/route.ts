import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OptiRelay } from '@/sdk/src/index';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const optirelay = new OptiRelay({
  apiKey: process.env.PROMPTCRAFT_INTERNAL_API_KEY || 'internal',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
});

// Wrap OpenAI with our SDK
const wrappedOpenAI = optirelay.wrapOpenAI(openai);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, input, model = 'gpt-4', temperature = 0.7, max_tokens = 1000 } = await request.json();

    if (!prompt || !input) {
      return NextResponse.json({ 
        error: 'Prompt and input are required' 
      }, { status: 400 });
    }

    const startTime = Date.now();
    
    // Use SDK-wrapped OpenAI client
    const completion = await wrappedOpenAI.chat.completions.create({
      model,
      messages: [{ role: 'user', content: `${prompt}\n\nInput: ${input}` }],
      temperature,
      max_tokens,
    }, {
      promptId: 'internal-test',
      userId,
      metadata: { source: 'internal-test' }
    });

    const duration = Date.now() - startTime;
    const output = completion.choices[0]?.message?.content || '';
    const tokens = completion.usage?.total_tokens || 0;
    
    const costPerToken = getCostPerToken(model);
    const cost = (tokens / 1000) * costPerToken;

    return NextResponse.json({
      output,
      tokens,
      cost,
      duration,
      quality: assessQuality(output, input),
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { error: 'Failed to test prompt' },
      { status: 500 }
    );
  }
}

function getCostPerToken(model: string): number {
  const costs: { [key: string]: number } = {
    'gpt-4': 0.03,
    'gpt-3.5-turbo': 0.002,
    'claude-3-sonnet': 0.015,
    'claude-3-haiku': 0.001
  };
  return costs[model] || 0.01;
}

function assessQuality(output: string, input: string): number {
  let score = 50; // Base score

  // Length check
  if (output.length > 50) score += 10;
  if (output.length > 200) score += 10;

  // Structure check
  if (output.includes('\n') || output.includes('•') || output.includes('-')) score += 10;
  
  // Completeness check
  if (output.length > input.length * 0.5) score += 10;
  
  // Coherence check (simple heuristics)
  const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) score += 10;
  
  // Specificity check
  if (output.includes('specific') || output.includes('detailed') || output.includes('example')) score += 10;

  return Math.min(100, Math.max(0, score));
}
