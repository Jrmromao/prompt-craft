import Link from 'next/link';

export default function AnthropicDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <h1>Anthropic (Claude) Integration</h1>
        <p className="lead">
          Track your Anthropic API costs including Claude 3 Opus, Sonnet, and Haiku.
        </p>

        <h2>Installation</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`npm install promptcraft-sdk @anthropic-ai/sdk`}
        </pre>

        <h2>Basic Usage</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`import PromptCraft from 'promptcraft-sdk';
import Anthropic from '@anthropic-ai/sdk';

// Initialize
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Make your API call
const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
};

const start = Date.now();
const result = await anthropic.messages.create(params);

// Track the call
await promptcraft.trackAnthropic(params, result, Date.now() - start);

console.log(result.content[0].text);`}
        </pre>

        <h2>Tagging Prompts</h2>
        <p>
          Add a <code>promptId</code> to group and analyze specific prompts:
        </p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [...],
  promptId: 'content-generation-v1' // Tag for analytics
};`}
        </pre>

        <h2>Error Handling</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const start = Date.now();
try {
  const result = await anthropic.messages.create(params);
  await promptcraft.trackAnthropic(params, result, Date.now() - start);
  return result;
} catch (error) {
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    Date.now() - start
  );
  throw error;
}`}
        </pre>

        <h2>Supported Models</h2>
        <ul>
          <li><strong>Claude 3 Opus</strong> - $0.015 per 1K tokens (most capable)</li>
          <li><strong>Claude 3 Sonnet</strong> - $0.003 per 1K tokens (balanced)</li>
          <li><strong>Claude 3 Haiku</strong> - $0.00025 per 1K tokens (fastest)</li>
        </ul>
        <p className="text-sm text-gray-600">
          Costs are calculated automatically based on official Anthropic pricing.
        </p>

        <h2>What Gets Tracked</h2>
        <ul>
          <li>Model name (e.g., claude-3-opus-20240229)</li>
          <li>Token usage (input + output)</li>
          <li>Cost (calculated from tokens × model price)</li>
          <li>Latency (response time in ms)</li>
          <li>Success/failure status</li>
          <li>Timestamp</li>
          <li>Prompt ID (if provided)</li>
        </ul>

        <h2>Best Practices</h2>
        <ol>
          <li><strong>Choose the right model</strong> - Haiku is 60x cheaper than Opus</li>
          <li><strong>Track errors</strong> - Monitor failure rates</li>
          <li><strong>Use prompt IDs</strong> - Analyze performance by use case</li>
          <li><strong>Set max_tokens</strong> - Control output length and cost</li>
        </ol>

        <h2>Next Steps</h2>
        <ul>
          <li><Link href="/docs/openai">OpenAI Integration</Link></li>
          <li><Link href="/docs/errors">Error Tracking Guide</Link></li>
          <li><Link href="/docs/sdk">SDK Reference</Link></li>
        </ul>
      </article>
    </div>
  );
}
