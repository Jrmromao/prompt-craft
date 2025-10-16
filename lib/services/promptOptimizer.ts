export async function optimizePrompt(prompt: string) {
  return {
    original: prompt,
    optimized: prompt.trim(),
    tokensSaved: 0,
    costSaved: 0,
  };
}
