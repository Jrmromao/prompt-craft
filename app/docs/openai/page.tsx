import Link from 'next/link';

export default function OpenAIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <h1>OpenAI Integration</h1>
        <p className="lead">
          Track your OpenAI API costs including GPT-4, GPT-3.5-Turbo, and other models.
        </p>

        <h2>Installation</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`npm install promptcraft-sdk openai`}
        </pre>

        <h2>Basic Usage</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

// Initialize
const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Make your API call
const params = {
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
};

const start = Date.now();
const result = await openai.chat.completions.create(params);

// Track the call
await promptcraft.trackOpenAI(params, result, Date.now() - start);

console.log(result.choices[0].message.content);`}
        </pre>

        <h2 id="tagging">Tagging Prompts</h2>
        <p>
          Add a <code>promptId</code> to group and analyze specific prompts in your dashboard:
        </p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const params = {
  model: 'gpt-4',
  messages: [...],
  promptId: 'customer-support-v2' // Tag for analytics
};`}
        </pre>

        <h2>Error Handling</h2>
        <p>Always track failed calls to monitor error rates:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, Date.now() - start);
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
        <p>All OpenAI models are supported:</p>
        <ul>
          <li><strong>GPT-4</strong> - $0.03 per 1K tokens</li>
          <li><strong>GPT-4 Turbo</strong> - $0.01 per 1K tokens</li>
          <li><strong>GPT-3.5-Turbo</strong> - $0.0005 per 1K tokens</li>
        </ul>
        <p className="text-sm text-gray-600">
          Costs are calculated automatically based on official OpenAI pricing.
        </p>

        <h2>What Gets Tracked</h2>
        <ul>
          <li>Model name (e.g., gpt-4, gpt-3.5-turbo)</li>
          <li>Token usage (input + output)</li>
          <li>Cost (calculated from tokens × model price)</li>
          <li>Latency (response time in ms)</li>
          <li>Success/failure status</li>
          <li>Timestamp</li>
          <li>Prompt ID (if provided)</li>
        </ul>

        <h2>Best Practices</h2>
        <ol>
          <li><strong>Always track errors</strong> - Use try/catch with trackError()</li>
          <li><strong>Use prompt IDs</strong> - Tag prompts for better analytics</li>
          <li><strong>Monitor latency</strong> - Slow responses cost more</li>
          <li><strong>Set budget alerts</strong> - Get notified before overspending</li>
        </ol>

        <h2>Next Steps</h2>
        <ul>
          <li><Link href="/docs/anthropic">Anthropic Integration</Link></li>
          <li><Link href="/docs/errors">Error Tracking Guide</Link></li>
          <li><Link href="/docs/sdk">SDK Reference</Link></li>
        </ul>
      </article>
    </div>
  );
}
