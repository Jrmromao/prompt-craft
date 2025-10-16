import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PromptCraft } from '@/sdk/src/index';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const promptcraft = new PromptCraft({
  apiKey: process.env.PROMPTCRAFT_INTERNAL_API_KEY || 'internal',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
});

const wrappedOpenAI = promptcraft.wrapOpenAI(openai);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, type = 'improvements' } = await request.json();

    if (!prompt || prompt.length < 10) {
      return NextResponse.json({ 
        error: 'Prompt too short. Please provide a more detailed prompt.' 
      }, { status: 400 });
    }

    let systemPrompt = '';
    switch (type) {
      case 'improvements':
        systemPrompt = `You are an expert prompt engineer. Analyze the given prompt and provide 3-5 specific, actionable suggestions to improve it. Focus on clarity, specificity, and effectiveness. Return only the suggestions as a JSON array of strings.`;
        break;
      case 'optimization':
        systemPrompt = `You are a prompt optimization expert. Provide 3 alternative versions of the given prompt that are more effective, clear, and specific. Return as a JSON array of strings.`;
        break;
      case 'examples':
        systemPrompt = `You are a prompt engineering specialist. Generate 2-3 example prompts that follow best practices and could inspire the user. Return as a JSON array of strings.`;
        break;
      default:
        systemPrompt = `You are an AI assistant. Provide helpful suggestions for the given prompt. Return as a JSON array of strings.`;
    }

    const completion = await wrappedOpenAI.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Prompt to analyze: "${prompt}"` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }, {
      promptId: 'internal-suggestions',
      userId,
      metadata: { source: 'internal-suggestions', type }
    });

    const response = completion.choices[0]?.message?.content;
    let suggestions: string[] = [];

    try {
      suggestions = JSON.parse(response || '[]');
    } catch {
      // Fallback if JSON parsing fails
      suggestions = [
        'Add more specific instructions about the desired output format',
        'Include examples to clarify your expectations',
        'Specify the tone and style you want the response to have',
        'Add constraints or limitations if applicable'
      ];
    }

    return NextResponse.json({ 
      suggestions,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
