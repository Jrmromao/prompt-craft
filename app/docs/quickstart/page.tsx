import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function QuickStartPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Docs
      </Link>

      <article className="prose prose-lg max-w-none">
        <h1>Quick Start Guide</h1>
        <p className="text-xl text-gray-600">Get started with PromptCraft in 5 minutes.</p>

        <h2>Step 1: Sign Up (1 minute)</h2>
        <ol>
          <li>Go to <a href="/">promptcraft.app</a></li>
          <li>Click "Start Free Trial"</li>
          <li>Sign up with email or Google/GitHub</li>
          <li>You're in! Free tier includes 1,000 runs/month</li>
        </ol>

        <h2>Step 2: Get Your API Key (1 minute)</h2>
        <ol>
          <li>Go to <Link href="/settings">Settings</Link></li>
          <li>Click "Create Key"</li>
          <li>Name it (e.g., "Production")</li>
          <li><strong>Copy the key now</strong> - you won't see it again!</li>
          <li>Save it to your <code>.env</code> file</li>
        </ol>

        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`PROMPTCRAFT_API_KEY=pc_your_key_here`}
        </pre>

        <h2>Step 3: Install SDK (30 seconds)</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`npm install promptcraft-sdk`}
        </pre>

        <h2>Step 4: Add 2 Lines of Code (2 minutes)</h2>
        
        <h3>For OpenAI:</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import PromptCraft from 'promptcraft-sdk';
import OpenAI from 'openai';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const openai = new OpenAI();

// Your existing code:
const params = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
};

// Add these 2 lines:
const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);
// Done!`}
        </pre>

        <h3>For Anthropic:</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import PromptCraft from 'promptcraft-sdk';
import Anthropic from '@anthropic-ai/sdk';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});
const anthropic = new Anthropic();

// Your existing code:
const params = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
};

// Add these 2 lines:
const start = Date.now();
const result = await anthropic.messages.create(params);
await promptcraft.trackAnthropic(params, result, Date.now() - start);
// Done!`}
        </pre>

        <h2>Step 5: View Your Dashboard (30 seconds)</h2>
        <ol>
          <li>Make a few API calls</li>
          <li>Go to <Link href="/dashboard">Dashboard</Link></li>
          <li>See your costs in real-time!</li>
        </ol>

        <h2>What You'll See</h2>
        <ul>
          <li><strong>Total runs</strong> - Number of API calls tracked</li>
          <li><strong>Total cost</strong> - How much you've spent</li>
          <li><strong>Cost per run</strong> - Average cost per API call</li>
          <li><strong>Success rate</strong> - Percentage of successful calls</li>
          <li><strong>Charts</strong> - Cost trends over time</li>
        </ul>

        <h2>Next Steps</h2>
        
        <h3>Set Budget Alerts</h3>
        <ol>
          <li>Go to <Link href="/settings">Settings</Link></li>
          <li>Set a monthly budget (e.g., $100)</li>
          <li>Get notified at 50%, 80%, 100%</li>
        </ol>

        <h3>Tag Your Prompts</h3>
        <p>Add <code>promptId</code> to track specific prompts:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const params = {
  model: 'gpt-4',
  messages: [...],
  promptId: 'customer-support-v1' // Track this prompt
};`}
        </pre>

        <h2>Common Issues</h2>
        
        <h3>"API key not working"</h3>
        <ul>
          <li>Check it starts with <code>pc_</code></li>
          <li>Make sure you copied the whole key</li>
          <li>Verify it wasn't deleted in Settings</li>
        </ul>

        <h3>"Not seeing data"</h3>
        <ul>
          <li>Wait 1-2 minutes for sync</li>
          <li>Check browser console for errors</li>
          <li>Verify you're calling <code>trackOpenAI()</code> or <code>trackAnthropic()</code></li>
        </ul>

        <h2>Need Help?</h2>
        <ul>
          <li><strong>Full Guide</strong>: <Link href="/docs/guide">Developer Guide</Link></li>
          <li><strong>API Docs</strong>: <Link href="/docs/api">API Reference</Link></li>
          <li><strong>Email</strong>: support@promptcraft.app</li>
        </ul>
      </article>
    </div>
  );
}
