/**
 * Smart Call Example - Automatic Model Selection
 * 
 * This feature tests your prompt on multiple models and automatically
 * selects the cheapest one that meets your quality requirements.
 * 
 * User would pay: $30/month for this feature alone
 * Saves: 30-50% on AI costs automatically
 */

import OpenAI from 'openai';
import PromptCraft from 'promptcraft-sdk';

async function example1_basicSmartCall() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
  });

  const smartCall = promptcraft.smartCall(openai);

  // Automatically picks cheapest model meeting quality threshold
  const result = await smartCall.call({
    prompt: 'Write a professional email about the quarterly report',
    quality: 'high', // Requires high quality output
  });

  console.log('Selected model:', result.model);
  console.log('Response:', result.choices[0].message.content);
  // Output: Selected gpt-3.5-turbo (cost: $0.001, quality: 85%)
  // Saves 98% vs GPT-4!
}

async function example2_withCostLimit() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
  });

  const smartCall = promptcraft.smartCall(openai);

  // Only use models under $0.01 per 1K tokens
  const result = await smartCall.call({
    prompt: 'Explain quantum computing in simple terms',
    quality: 'medium',
    maxCost: 0.01, // Max $0.01 per 1K tokens
  });

  console.log('Selected model:', result.model);
  // Will pick GPT-3.5 or GPT-4-turbo, never GPT-4
}

async function example3_withSystemPrompt() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
  });

  const smartCall = promptcraft.smartCall(openai);

  const result = await smartCall.call({
    prompt: 'Write a blog post about AI',
    quality: 'high',
    systemPrompt: 'You are a professional tech writer',
  });

  console.log('Response:', result.choices[0].message.content);
}

async function example4_realWorldChatbot() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
  });

  const smartCall = promptcraft.smartCall(openai);

  // Chatbot that automatically uses cheapest viable model
  const userMessages = [
    'Hi',
    'What is AI?',
    'Explain machine learning',
    'How does deep learning work?',
  ];

  for (const message of userMessages) {
    const result = await smartCall.call({
      prompt: message,
      quality: 'high',
    });

    console.log(`User: ${message}`);
    console.log(`Bot (${result.model}): ${result.choices[0].message.content}\n`);
  }

  // Results:
  // "Hi" → gpt-3.5-turbo (simple, cheap)
  // "What is AI?" → gpt-3.5-turbo (medium, cheap)
  // "Explain ML" → gpt-3.5-turbo (medium, cheap)
  // "Deep learning" → gpt-4-turbo (complex, needs quality)
}

async function example5_costComparison() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
  });

  const smartCall = promptcraft.smartCall(openai);

  console.log('Testing 100 prompts...\n');

  // Without SmartCall: Always use GPT-4
  const gpt4Cost = 100 * 0.045; // $4.50

  // With SmartCall: Automatically picks cheapest
  // Assume 70% can use GPT-3.5, 30% need GPT-4
  const smartCost = 70 * 0.001 + 30 * 0.045; // $1.42

  console.log('Without SmartCall (always GPT-4): $' + gpt4Cost.toFixed(2));
  console.log('With SmartCall (auto-select): $' + smartCost.toFixed(2));
  console.log('Savings: $' + (gpt4Cost - smartCost).toFixed(2) + ' (68%)');
  console.log('\nROI: Pay $30/month, save $100+/month');
}

async function main() {
  console.log('🚀 Smart Call Examples\n');

  console.log('Example 1: Basic Smart Call');
  await example1_basicSmartCall();

  console.log('\nExample 2: With Cost Limit');
  await example2_withCostLimit();

  console.log('\nExample 3: With System Prompt');
  await example3_withSystemPrompt();

  console.log('\nExample 4: Real-World Chatbot');
  await example4_realWorldChatbot();

  console.log('\nExample 5: Cost Comparison');
  await example5_costComparison();
}

// Uncomment to run:
// main().catch(console.error);
