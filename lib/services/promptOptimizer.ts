import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function optimizePrompt(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at optimizing prompts. Make them concise while preserving intent and clarity. Remove unnecessary words, politeness, and redundancy.',
        },
        {
          role: 'user',
          content: `Optimize this prompt:\n\n${prompt}`,
        },
      ],
      temperature: 0.3,
    });

    const optimized = response.choices[0]?.message?.content || prompt;
    const originalTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(optimized.length / 4);
    const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
    const costSaved = (tokensSaved / 1000) * 0.002; // Assuming GPT-3.5 pricing

    return {
      original: prompt,
      optimized,
      originalTokens,
      optimizedTokens,
      tokensSaved,
      costSaved,
      savingsPercent: originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0,
    };
  } catch (error) {
    console.error('Optimization error:', error);
    return {
      original: prompt,
      optimized: prompt.trim(),
      originalTokens: Math.ceil(prompt.length / 4),
      optimizedTokens: Math.ceil(prompt.trim().length / 4),
      tokensSaved: 0,
      costSaved: 0,
      savingsPercent: 0,
    };
  }
}
