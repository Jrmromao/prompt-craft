'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
    </div>
  );
}

export default function APIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">REST API Reference</h1>
      <p className="text-xl text-gray-600 mb-12">
        Direct API integration without the SDK.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Base URL</h2>
      <CodeBlock code="https://promptcraft.app/api" language="text" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Authentication</h2>
      <p className="text-gray-700 mb-4">All API requests require authentication via API key in the Authorization header:</p>
      <CodeBlock code="Authorization: Bearer pc_your_api_key_here" language="text" />

      <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Endpoints</h2>

      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">POST /api/integrations/run</h3>
        <p className="text-gray-700 mb-4">Track an AI API call.</p>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Request</h4>
        <CodeBlock code={`POST /api/integrations/run
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
}`} language="json" />

        <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h4>
        <CodeBlock code={`{
  "success": true,
  "runId": "run_abc123"
}`} language="json" />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">GET /api/analytics/overview</h3>
        <p className="text-gray-700 mb-4">Get analytics overview.</p>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Query Parameters</h4>
        <ul className="space-y-2 text-gray-700 list-disc list-inside mb-6">
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">startDate</code> (ISO 8601) - Start date for analytics</li>
          <li><code className="bg-gray-100 px-2 py-1 rounded text-sm">endDate</code> (ISO 8601) - End date for analytics</li>
        </ul>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Response</h4>
        <CodeBlock code={`{
  "totalRuns": 1234,
  "totalCost": 45.67,
  "totalTokens": 123456,
  "avgCostPerRun": 0.037,
  "successRate": 98.5,
  "avgLatency": 1234
}`} language="json" />
      </div>

      <div className="border-t border-gray-200 pt-8 mt-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">GET /api/usage</h3>
        <p className="text-gray-700 mb-4">Get current usage stats.</p>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">Response</h4>
        <CodeBlock code={`{
  "plan": "free",
  "runsThisMonth": 234,
  "runsLimit": 1000,
  "percentUsed": 23.4
}`} language="json" />
      </div>

      <h2 id="rate-limits" className="text-2xl font-bold text-gray-900 mt-16 mb-4">Rate Limits</h2>
      <p className="text-gray-700 mb-4">Rate limits are per API key:</p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Plan</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Requests/Minute</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">Free</td>
              <td className="px-4 py-3 text-sm text-gray-700">10</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">Starter</td>
              <td className="px-4 py-3 text-sm text-gray-700">60</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">Pro</td>
              <td className="px-4 py-3 text-sm text-gray-700">300</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">Enterprise</td>
              <td className="px-4 py-3 text-sm text-gray-700">1,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Rate Limit Response</h3>
      <p className="text-gray-700 mb-4">When rate limited, you'll receive:</p>
      <CodeBlock code={`{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}`} language="json" />

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Error Codes</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">401</td>
              <td className="px-4 py-3 text-sm text-gray-700">Unauthorized - Invalid API key</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">402</td>
              <td className="px-4 py-3 text-sm text-gray-700">Payment Required - Upgrade needed</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">429</td>
              <td className="px-4 py-3 text-sm text-gray-700">Too Many Requests - Rate limit exceeded</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-700">500</td>
              <td className="px-4 py-3 text-sm text-gray-700">Internal Server Error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Example: cURL</h2>
      <CodeBlock code={`curl -X POST https://promptcraft.app/api/integrations/run \\
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
  }'`} language="bash" />

      <h2 className="text-2xl font-bold text-gray-900 mt-16 mb-4">Example: Python</h2>
      <CodeBlock code={`import requests

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
)`} language="python" />
    </div>
  );
}
