/**
 * PromptCraft SDK v2.0 - Killer Features Examples
 * 
 * This file demonstrates the new killer features in SDK v2.0:
 * - Auto-Fallback
 * - Smart Routing
 * - Cost Limits
 * - Custom Fallbacks
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import PromptCraft from 'promptcraft-sdk';

// ============================================================================
// Example 1: Auto-Fallback - Never lose a request
// ============================================================================

async function example1_autoFallback() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    autoFallback: true, // 🔥 Enable auto-fallback
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  try {
    // If GPT-4 fails, automatically tries:
    // 1. gpt-4-turbo
    // 2. gpt-3.5-turbo
    const result = await trackedOpenAI.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Explain quantum computing' }],
    });

    console.log('✅ Success:', result.choices[0].message.content);
    // Console output:
    // [PromptCraft] Fallback: gpt-4 failed, trying gpt-4-turbo...
    // [PromptCraft] Fallback success: gpt-4 → gpt-4-turbo
  } catch (error) {
    console.error('❌ All models failed:', error);
  }
}

// ============================================================================
// Example 2: Smart Routing - Automatic cost optimization
// ============================================================================

async function example2_smartRouting() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    smartRouting: true, // 🔥 Enable smart routing
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  // Simple query → automatically routed to GPT-3.5 (60x cheaper!)
  const simpleResult = await trackedOpenAI.chat.completions.create({
    model: 'gpt-4', // You request GPT-4
    messages: [{ role: 'user', content: 'Hi' }], // But it's simple
  });
  // Console: [PromptCraft] Smart routing: gpt-4 → gpt-3.5-turbo
  // Saves: $0.045 → $0.001 per 1K tokens (98% cost reduction!)

  // Complex query → uses requested model
  const complexResult = await trackedOpenAI.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a quantum physics expert' },
      {
        role: 'user',
        content:
          'Explain quantum entanglement, superposition, and decoherence in detail with examples',
      },
    ],
  });
  // No routing - complex query uses GPT-4 as requested
}

// ============================================================================
// Example 3: Cost Limits - Budget protection
// ============================================================================

async function example3_costLimits() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Global cost limit
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    costLimit: 0.1, // 🔥 Max $0.10 per request globally
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  try {
    // This will throw if estimated cost > $0.10
    const result = await trackedOpenAI.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Very long prompt...' }],
    });
  } catch (error) {
    console.error('❌ Cost limit exceeded:', error);
    // Error: Estimated cost $0.15 exceeds limit $0.10
  }

  // Per-request cost limit (overrides global)
  try {
    const result = await trackedOpenAI.chat.completions.create(
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Another prompt' }],
      },
      { maxCost: 0.05 } // 🔥 Max $0.05 for this request only
    );
  } catch (error) {
    console.error('❌ Request cost limit exceeded:', error);
  }
}

// ============================================================================
// Example 4: Custom Fallback Models
// ============================================================================

async function example4_customFallbacks() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    autoFallback: true,
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  // Override default fallback chain
  const result = await trackedOpenAI.chat.completions.create(
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello!' }],
    },
    {
      fallbackModels: ['gpt-3.5-turbo'], // 🔥 Skip GPT-4-turbo, go straight to GPT-3.5
    }
  );
  // If GPT-4 fails → tries GPT-3.5 immediately
}

// ============================================================================
// Example 5: All Features Combined
// ============================================================================

async function example5_allFeatures() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    enableCache: true, // Cache responses
    autoFallback: true, // Auto-fallback on errors
    smartRouting: true, // Route to cheaper models
    costLimit: 0.1, // Max $0.10 per request
    maxRetries: 3, // Retry failed requests
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  const result = await trackedOpenAI.chat.completions.create(
    {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Explain AI' }],
    },
    {
      cacheTTL: 3600000, // Cache for 1 hour
      maxCost: 0.05, // Max $0.05 for this request
      promptId: 'explain-ai-v1', // Track by prompt ID
    }
  );

  // What happens:
  // 1. ✅ Smart routing: Simple query → GPT-3.5 (saves 98%)
  // 2. ✅ Cost check: Estimated $0.001 < $0.05 limit
  // 3. ✅ Cache check: Not cached, proceed
  // 4. ✅ API call: Makes request to GPT-3.5
  // 5. ✅ Auto-retry: Retries up to 3 times if fails
  // 6. ✅ Auto-fallback: Falls back if all retries fail
  // 7. ✅ Cache: Stores result for 1 hour
  // 8. ✅ Track: Logs to PromptCraft dashboard
  // 9. ✅ Return: Returns result to user

  console.log('✅ Result:', result.choices[0].message.content);
}

// ============================================================================
// Example 6: Anthropic with Killer Features
// ============================================================================

async function example6_anthropic() {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    autoFallback: true,
    smartRouting: true,
  });

  const trackedAnthropic = promptcraft.wrapAnthropic(anthropic);

  // Simple query → automatically routed to Haiku (60x cheaper!)
  const result = await trackedAnthropic.messages.create({
    model: 'claude-3-opus-20240229', // You request Opus
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hi' }], // But it's simple
  });
  // Console: [PromptCraft] Smart routing: claude-3-opus → claude-3-haiku
  // Saves: $0.045 → $0.000875 per 1K tokens (98% cost reduction!)

  // If Opus fails → tries Sonnet → tries Haiku
}

// ============================================================================
// Example 7: Real-World Use Case - Chatbot
// ============================================================================

async function example7_chatbot() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const promptcraft = new PromptCraft({
    apiKey: process.env.PROMPTCRAFT_API_KEY!,
    enableCache: true,
    autoFallback: true,
    smartRouting: true,
    costLimit: 0.05, // Max $0.05 per message
  });

  const trackedOpenAI = promptcraft.wrapOpenAI(openai);

  // Simulate chatbot conversation
  const messages = [
    'Hi',
    'What is AI?',
    'Explain machine learning',
    'How does deep learning work?',
  ];

  for (const message of messages) {
    const result = await trackedOpenAI.chat.completions.create(
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
      },
      {
        cacheTTL: 3600000, // Cache common questions
        promptId: 'chatbot-v1',
      }
    );

    console.log(`User: ${message}`);
    console.log(`Bot: ${result.choices[0].message.content}\n`);
  }

  // What happens:
  // 1. "Hi" → Smart routing to GPT-3.5 (simple)
  // 2. "What is AI?" → Cached if asked before
  // 3. "Explain ML" → Smart routing to GPT-3.5 (medium)
  // 4. "Deep learning" → Uses GPT-4 (complex)
  // All with auto-fallback and cost limits!
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  console.log('🚀 PromptCraft SDK v2.0 - Killer Features Examples\n');

  console.log('Example 1: Auto-Fallback');
  await example1_autoFallback();

  console.log('\nExample 2: Smart Routing');
  await example2_smartRouting();

  console.log('\nExample 3: Cost Limits');
  await example3_costLimits();

  console.log('\nExample 4: Custom Fallbacks');
  await example4_customFallbacks();

  console.log('\nExample 5: All Features Combined');
  await example5_allFeatures();

  console.log('\nExample 6: Anthropic with Killer Features');
  await example6_anthropic();

  console.log('\nExample 7: Real-World Chatbot');
  await example7_chatbot();

  console.log('\n✨ All examples completed!');
}

// Uncomment to run:
// main().catch(console.error);
