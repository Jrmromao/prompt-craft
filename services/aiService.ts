import type { PromptPayload } from '@/types/ai';

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

export async function sendPromptToLLM(payload: PromptPayload): Promise<any> {
  // Build the JSON payload for the LLM
  const llmPayload = {
    prompt: payload.content,
    meta: {
      name: payload.name,
      description: payload.description,
      tags: payload.tags,
      tone: payload.tone,
      format: payload.format,
      wordCount: payload.wordCount,
      targetAudience: payload.targetAudience,
      includeExamples: payload.includeExamples,
      includeKeywords: payload.includeKeywords,
      includeStructure: payload.includeStructure,
    },
  };

  // Replace with your LLM endpoint
  const endpoint = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';

  // Example: using OpenAI API (adjust as needed)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify(llmPayload),
  });

  if (!response.ok) {
    throw new Error('Failed to get response from LLM');
  }

  return response.json();
} 