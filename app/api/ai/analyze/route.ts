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

const wrappedOpenAI = optirelay.wrapOpenAI(openai);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt || prompt.length < 10) {
      return NextResponse.json({ 
        error: 'Prompt too short for analysis' 
      }, { status: 400 });
    }

    const systemPrompt = `You are an expert prompt analyst. Analyze the given prompt and provide metrics for:
1. Clarity (0-100): How clear and understandable is the prompt?
2. Specificity (0-100): How specific and detailed are the instructions?
3. Effectiveness (0-100): How likely is this prompt to produce good results?
4. Estimated cost (0-1): Rough estimate of API cost for this prompt

Return ONLY a JSON object with these exact keys: clarity, specificity, effectiveness, cost.`;

    const completion = await wrappedOpenAI.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this prompt: "${prompt}"` }
      ],
      temperature: 0.3,
      max_tokens: 200,
    }, {
      promptId: 'internal-analyze',
      userId,
      metadata: { source: 'internal-analyze' }
    });

    const response = completion.choices[0]?.message?.content;
    let metrics = {
      clarity: 75,
      specificity: 70,
      effectiveness: 80,
      cost: 0.15
    };

    try {
      const parsed = JSON.parse(response || '{}');
      metrics = {
        clarity: Math.min(100, Math.max(0, parsed.clarity || 75)),
        specificity: Math.min(100, Math.max(0, parsed.specificity || 70)),
        effectiveness: Math.min(100, Math.max(0, parsed.effectiveness || 80)),
        cost: Math.min(1, Math.max(0, parsed.cost || 0.15))
      };
    } catch {
      // Use default metrics if parsing fails
    }

    // Calculate additional insights
    const insights = [];
    if (metrics.clarity < 60) insights.push('Consider making your instructions clearer');
    if (metrics.specificity < 60) insights.push('Add more specific details and examples');
    if (metrics.effectiveness < 70) insights.push('The prompt structure could be improved');
    if (metrics.cost > 0.5) insights.push('Consider shortening the prompt to reduce costs');

    return NextResponse.json({ 
      metrics,
      insights,
      wordCount: prompt.split(' ').length,
      characterCount: prompt.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    );
  }
}
