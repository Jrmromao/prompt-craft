export default function ErrorsDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <h1>Error Tracking</h1>
        <p className="lead">
          Track failed API calls to monitor error rates and identify issues.
        </p>

        <h2>Why Track Errors?</h2>
        <ul>
          <li>Monitor success rates in your dashboard</li>
          <li>Identify problematic prompts or models</li>
          <li>Get alerted when error rates spike</li>
          <li>Debug issues faster with error logs</li>
        </ul>

        <h2>Basic Error Tracking</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`import PromptCraft from 'promptcraft-sdk';

const promptcraft = new PromptCraft({ 
  apiKey: process.env.PROMPTCRAFT_API_KEY 
});

const start = Date.now();
try {
  const result = await openai.chat.completions.create(params);
  await promptcraft.trackOpenAI(params, result, Date.now() - start);
} catch (error) {
  // Track the error
  await promptcraft.trackError(
    params.model,
    JSON.stringify(params.messages),
    error,
    Date.now() - start
  );
  throw error; // Re-throw to handle in your app
}`}
        </pre>

        <h2>What Gets Tracked</h2>
        <p>When you track an error, we capture:</p>
        <ul>
          <li><strong>Model</strong> - Which model failed</li>
          <li><strong>Input</strong> - What was sent to the API</li>
          <li><strong>Error message</strong> - The error details</li>
          <li><strong>Latency</strong> - How long before it failed</li>
          <li><strong>Timestamp</strong> - When it happened</li>
        </ul>

        <h2>Common Error Types</h2>
        
        <h3>Rate Limit Errors</h3>
        <p>When you exceed API rate limits:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`Error: Rate limit exceeded
Solution: Implement exponential backoff or upgrade your API plan`}
        </pre>

        <h3>Invalid Request Errors</h3>
        <p>When parameters are incorrect:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`Error: Invalid model specified
Solution: Check model name spelling and availability`}
        </pre>

        <h3>Authentication Errors</h3>
        <p>When API keys are invalid:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`Error: Invalid API key
Solution: Verify your API key is correct and active`}
        </pre>

        <h2>Viewing Errors in Dashboard</h2>
        <p>Go to your dashboard to see:</p>
        <ul>
          <li>Overall success rate percentage</li>
          <li>Error rate trends over time</li>
          <li>Most common error messages</li>
          <li>Which prompts have highest error rates</li>
        </ul>

        <h2>Best Practices</h2>
        <ol>
          <li><strong>Always use try/catch</strong> - Never skip error handling</li>
          <li><strong>Track before re-throwing</strong> - Log to PromptCraft then handle in your app</li>
          <li><strong>Include context</strong> - Use promptId to identify problematic prompts</li>
          <li><strong>Set error rate alerts</strong> - Get notified when errors spike</li>
        </ol>

        <h2>Error Rate Alerts</h2>
        <p>Set up alerts in Settings to get notified when:</p>
        <ul>
          <li>Error rate exceeds 5%</li>
          <li>Specific prompt has high failure rate</li>
          <li>New error types appear</li>
        </ul>
      </article>
    </div>
  );
}
