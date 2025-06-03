import { PromptPayload } from '@/types/ai';

// Example: PromptPayload type
// interface PromptPayload {
//   name: string;
//   description?: string;
//   content: string;
//   tags?: string[];
//   tone?: string;
//   format?: string;
//   wordCount?: string;
//   targetAudience?: string;
//   includeExamples?: boolean;
//   includeKeywords?: boolean;
//   includeStructure?: boolean;
// }

export async function sendPromptToLLM(payload: PromptPayload, model?: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: payload.content,
        model: model || 'deepseek',
        maxTokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error === 'Insufficient credits') {
        throw new Error('Insufficient credits. Please purchase more credits to continue.');
      }
      if (errorData.upgradeRequired) {
        throw new Error('This feature requires a Pro subscription. Please upgrade to continue.');
      }
      throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function generateTextPrompt(payload: PromptPayload) {
  if (payload.promptType !== 'text') {
    throw new Error('Invalid prompt type for text generation');
  }

  // Add text-specific processing here
  return sendPromptToLLM(payload);
}

export async function generateImagePrompt(payload: PromptPayload) {
  if (payload.promptType !== 'image') {
    throw new Error('Invalid prompt type for image generation');
  }

  // Add image-specific processing here
  return sendPromptToLLM(payload);
}

export async function generateVideoPrompt(payload: PromptPayload) {
  if (payload.promptType !== 'video') {
    throw new Error('Invalid prompt type for video generation');
  }

  // Add video-specific processing here
  return sendPromptToLLM(payload);
}

export async function generateMusicPrompt(payload: PromptPayload) {
  if (payload.promptType !== 'music') {
    throw new Error('Invalid prompt type for music generation');
  }

  // Add music-specific processing here
  return sendPromptToLLM(payload);
} 