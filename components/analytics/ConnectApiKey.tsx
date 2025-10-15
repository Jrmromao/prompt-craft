'use client';

import { useState } from 'react';
import { Key, Loader2 } from 'lucide-react';

export function ConnectApiKey() {
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setApiKey('');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to connect API key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Key className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Connect API Key</h3>
          <p className="text-sm text-gray-600">Start tracking your AI costs</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <div className="flex gap-2">
            <button
              onClick={() => setProvider('openai')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                provider === 'openai'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => setProvider('anthropic')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                provider === 'anthropic'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Anthropic
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'openai' ? 'sk-proj-...' : 'sk-ant-...'}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your key is encrypted and never shared
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            ✓ API key connected successfully!
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect API Key'
          )}
        </button>
      </div>
    </div>
  );
}
