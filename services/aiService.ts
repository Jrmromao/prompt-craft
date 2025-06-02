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

export async function sendPromptToLLM(payload: PromptPayload) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return data;
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