export default function SDKDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <h1>SDK Reference</h1>
        <p className="lead">
          Complete reference for the PromptCraft SDK.
        </p>

        <h2>Installation</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`npm install promptcraft-sdk`}
        </pre>

        <h2>Constructor</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`new PromptCraft(config: PromptCraftConfig)`}
        </pre>

        <h3>Parameters</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>apiKey</code></td>
              <td>string</td>
              <td>Yes</td>
              <td>Your PromptCraft API key</td>
            </tr>
            <tr>
              <td><code>baseUrl</code></td>
              <td>string</td>
              <td>No</td>
              <td>Custom base URL (default: https://promptcraft.app)</td>
            </tr>
          </tbody>
        </table>

        <h3>Example</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const promptcraft = new PromptCraft({
  apiKey: 'pc_your_api_key_here',
  baseUrl: 'https://custom.promptcraft.app' // optional
});`}
        </pre>

        <h2>Methods</h2>

        <h3>trackOpenAI()</h3>
        <p>Track an OpenAI API call.</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`trackOpenAI(
  params: OpenAI.Chat.ChatCompletionCreateParams,
  result: OpenAI.Chat.ChatCompletion,
  latency: number
): Promise<void>`}
        </pre>

        <h4>Parameters</h4>
        <ul>
          <li><code>params</code> - The parameters passed to OpenAI</li>
          <li><code>result</code> - The response from OpenAI</li>
          <li><code>latency</code> - Time taken in milliseconds</li>
        </ul>

        <h4>Example</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);`}
        </pre>

        <h3>trackAnthropic()</h3>
        <p>Track an Anthropic (Claude) API call.</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`trackAnthropic(
  params: Anthropic.MessageCreateParams,
  result: Anthropic.Message,
  latency: number
): Promise<void>`}
        </pre>

        <h4>Parameters</h4>
        <ul>
          <li><code>params</code> - The parameters passed to Anthropic</li>
          <li><code>result</code> - The response from Anthropic</li>
          <li><code>latency</code> - Time taken in milliseconds</li>
        </ul>

        <h4>Example</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`const start = Date.now();
const result = await anthropic.messages.create(params);
await promptcraft.trackAnthropic(params, result, Date.now() - start);`}
        </pre>

        <h3>trackError()</h3>
        <p>Track a failed API call.</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`trackError(
  model: string,
  input: string,
  error: Error,
  latency: number
): Promise<void>`}
        </pre>

        <h4>Parameters</h4>
        <ul>
          <li><code>model</code> - The model that was attempted</li>
          <li><code>input</code> - The input that was sent</li>
          <li><code>error</code> - The error object</li>
          <li><code>latency</code> - Time taken before failure</li>
        </ul>

        <h4>Example</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, latency);
} catch (error) {
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    latency
  );
  throw error;
}`}
        </pre>

        <h2>Types</h2>

        <h3>PromptCraftConfig</h3>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`interface PromptCraftConfig {
  apiKey: string;
  baseUrl?: string;
}`}
        </pre>

        <h2>Environment Variables</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`# .env
PROMPTCRAFT_API_KEY=pc_your_api_key_here
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key`}
        </pre>
      </article>
    </div>
  );
}
