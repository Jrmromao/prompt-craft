import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface PromptRating {
  clarity: number;
  specificity: number;
  context: number;
  overall: number;
  feedback: string;
}

const RATING_PROMPT = `You are a prompt engineering expert. Rate the following prompt on a scale of 1-10 for each criterion and provide brief feedback.

IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any other text, markdown formatting, or explanations. The response must be parseable by JSON.parse().

Example of valid response format:
{"clarity":8,"specificity":7,"context":9,"overall":8,"feedback":"Good prompt with clear instructions"}

Prompt to rate:`;

const RESPONSE_PROMPT = `You are a helpful assistant. Follow these rules strictly:
1. Respond directly to the user's request without any introductory phrases
2. Do not use phrases like "Of course!", "Here's", "Let me", etc.
3. Get straight to the point
4. Provide the most relevant and concise answer possible
5. If the prompt is unclear or lacks context, ask for clarification instead of making assumptions`;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content, testInput } = await req.json();

    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // First, get the prompt rating
    const ratingResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: RATING_PROMPT
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!ratingResponse.ok) {
      const errorData = await ratingResponse.json().catch(() => ({}));
      throw new Error(
        `Failed to get prompt rating: ${errorData.error?.message || ratingResponse.statusText}`
      );
    }

    const ratingData = await ratingResponse.json();
    let promptRating: PromptRating;
    
    try {
      // Log the raw response for debugging
      console.log('Raw rating response:', ratingData.choices[0].message.content);
      
      // Clean the response content to ensure it's valid JSON
      const cleanContent = ratingData.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
      
      console.log('Cleaned content:', cleanContent);
      
      promptRating = JSON.parse(cleanContent);
      
      // Validate the rating object
      if (!promptRating.clarity || !promptRating.specificity || !promptRating.context || !promptRating.overall || !promptRating.feedback) {
        throw new Error('Invalid rating object structure');
      }
    } catch (error) {
      console.error('Failed to parse rating response:', error);
      console.error('Raw content:', ratingData.choices[0].message.content);
      promptRating = {
        clarity: 0,
        specificity: 0,
        context: 0,
        overall: 0,
        feedback: 'Failed to generate rating'
      };
    }

    // Then, get the actual response
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: RESPONSE_PROMPT
          },
          {
            role: 'user',
            content: testInput ? `${content}\n\nTest input: ${testInput}` : content
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to generate text with Deepseek: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Deepseek API');
    }

    return NextResponse.json({
      result: data.choices[0].message.content,
      rating: promptRating
    });
  } catch (error) {
    console.error('Error testing prompt:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to test prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 