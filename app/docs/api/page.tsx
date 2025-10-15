export default function APIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-lg max-w-none">
        <h1>REST API Reference</h1>
        <p className="lead">
          Direct API integration without the SDK.
        </p>

        <h2>Base URL</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`https://promptcraft.app/api`}
        </pre>

        <h2>Authentication</h2>
        <p>All API requests require authentication via API key in the Authorization header:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg">
{`Authorization: Bearer pc_your_api_key_here`}
        </pre>

        <h2>Endpoints</h2>

        <h3>POST /integrations/run</h3>
        <p>Track an AI API call.</p>

        <h4>Request</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`POST /api/integrations/run
Content-Type: application/json
Authorization: Bearer pc_your_api_key_here

{
  "provider": "openai",
  "model": "gpt-4",
  "input": "{\\"messages\\":[...]}",
  "output": "Hello! How can I help you?",
  "tokensUsed": 150,
  "latency": 1234,
  "success": true,
  "promptId": "greeting-v1"
}`}
        </pre>

        <h4>Response</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "success": true,
  "runId": "run_abc123"
}`}
        </pre>

        <h3>GET /analytics/overview</h3>
        <p>Get analytics overview.</p>

        <h4>Query Parameters</h4>
        <ul>
          <li><code>startDate</code> (ISO 8601) - Start date for analytics</li>
          <li><code>endDate</code> (ISO 8601) - End date for analytics</li>
        </ul>

        <h4>Response</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "totalRuns": 1234,
  "totalCost": 45.67,
  "totalTokens": 123456,
  "avgCostPerRun": 0.037,
  "successRate": 98.5,
  "avgLatency": 1234
}`}
        </pre>

        <h3>GET /usage</h3>
        <p>Get current usage stats.</p>

        <h4>Response</h4>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "plan": "free",
  "runsThisMonth": 234,
  "runsLimit": 1000,
  "percentUsed": 23.4
}`}
        </pre>

        <h2 id="rate-limits">Rate Limits</h2>
        <p>Rate limits are per API key:</p>

        <table className="min-w-full">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Requests/Minute</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Free</td>
              <td>10</td>
            </tr>
            <tr>
              <td>Starter</td>
              <td>60</td>
            </tr>
            <tr>
              <td>Pro</td>
              <td>300</td>
            </tr>
            <tr>
              <td>Enterprise</td>
              <td>1,000</td>
            </tr>
          </tbody>
        </table>

        <h3>Rate Limit Response</h3>
        <p>When rate limited, you'll receive:</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}`}
        </pre>

        <h2>Error Codes</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Code</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>401</td>
              <td>Unauthorized - Invalid API key</td>
            </tr>
            <tr>
              <td>402</td>
              <td>Payment Required - Upgrade needed</td>
            </tr>
            <tr>
              <td>429</td>
              <td>Too Many Requests - Rate limit exceeded</td>
            </tr>
            <tr>
              <td>500</td>
              <td>Internal Server Error</td>
            </tr>
          </tbody>
        </table>

        <h2>Example: cURL</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`curl -X POST https://promptcraft.app/api/integrations/run \\
  -H "Authorization: Bearer pc_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "model": "gpt-4",
    "input": "{\\"messages\\":[...]}",
    "output": "Hello!",
    "tokensUsed": 150,
    "latency": 1234,
    "success": true
  }'`}
        </pre>

        <h2>Example: Python</h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
{`import requests

response = requests.post(
    'https://promptcraft.app/api/integrations/run',
    headers={
        'Authorization': 'Bearer pc_your_api_key_here',
        'Content-Type': 'application/json'
    },
    json={
        'provider': 'openai',
        'model': 'gpt-4',
        'input': '{"messages":[...]}',
        'output': 'Hello!',
        'tokensUsed': 150,
        'latency': 1234,
        'success': True
    }
)`}
        </pre>
      </article>
    </div>
  );
}
