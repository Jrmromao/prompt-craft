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

export async function generateContent(payload: any, model?: string) {
  const authData = await auth();
  const { userId } = authData;
  const { getToken } = authData;
  const token = await getToken();
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/ai/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ payload, model }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate content');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}
