import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/aiService';

export async function POST(req: NextRequest) {
  try {
    const {
      content,
      temperature = 0.3,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      maxTokens = 1200,
    } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Prompt content is required' }, { status: 400 });
    }
    const aiService = AIService.getInstance();
    const prompt = `Rewrite and optimize the following prompt for clarity, effectiveness, and best practices. Only return the improved prompt, do not add any explanations.\n\nPrompt:\n${content}\n\nAfter the improved prompt, provide a JSON object on a new line with ratings (1-10) for: clarity, effectiveness, creativity, conciseness, and best_practices. Example:\n{\n  'clarity': 9,\n  'effectiveness': 8,\n  'creativity': 7,\n  'conciseness': 8,\n  'best_practices': 9\n}`;
    const aiResult = await aiService.generateText(prompt, {
      model: 'deepseek',
      temperature,
      topP,
      frequencyPenalty,
      presencePenalty,
      maxTokens,
    });
    if (!aiResult || !aiResult.text) {
      return NextResponse.json({ error: 'AI optimization failed' }, { status: 500 });
    }
    // Split the response into prompt and ratings JSON
    const match = aiResult.text.match(/([\s\S]*?)\n\s*({[\s\S]*})/);
    let optimizedContent = aiResult.text.trim();
    let ratings = null;
    if (match) {
      optimizedContent = match[1].trim();
      try {
        ratings = JSON.parse(match[2]);
      } catch (e) {
        ratings = null;
      }
    }
    // Return outputTokens if available
    return NextResponse.json({ optimizedContent, ratings, outputTokens: aiResult.tokenCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to optimize prompt' }, { status: 500 });
  }
} 