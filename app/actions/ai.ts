'use server';

import { auth } from '@clerk/nextjs/server';
import { PromptPayload } from '@/types/ai';
import { headers } from 'next/headers';

interface ErrorWithResponse extends Error {
  response?: {
    data: {
      currentCredits: number;
      requiredCredits: number;
      missingCredits: number;
    };
  };
}

export async function generateContent(payload: PromptPayload, model?: string) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const token = await getToken();
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: payload.content, model }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.error === 'Insufficient credits') {
        const error = new Error('Insufficient credits. Please purchase more credits to continue.') as ErrorWithResponse;
        error.response = {
          data: {
            currentCredits: data.currentCredits,
            requiredCredits: data.requiredCredits,
            missingCredits: data.missingCredits
          }
        };
        throw error;
      }
      if (data.upgradeRequired) {
        throw new Error('This feature requires a Pro subscription. Please upgrade to continue.');
      }
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
} 