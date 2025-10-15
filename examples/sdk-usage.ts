import OpenAI from 'openai';
import { PromptCraft } from '../lib/sdk';

// Initialize PromptCraft
const promptCraft = new PromptCraft({
  apiKey: 'your-promptcraft-api-key',
  baseUrl: 'https://promptcraft.app', // or http://localhost:3000 for dev
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Wrap the client to enable automatic tracking
promptCraft.wrapOpenAI(openai);

// Use OpenAI normally - tracking happens automatically
async function example() {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
    promptId: 'greeting-prompt', // Add this to track which prompt was used
  });

  console.log(response.choices[0].message.content);
}

example();
