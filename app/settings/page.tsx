'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showMessage('Please enter a key name', 'error');
      return;
    }

    setCreatingKey(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        showMessage('API Key created! Copy it now - you won\'t see it again.', 'success');
        setApiKeys([data.key, ...apiKeys]);
        setNewKeyName('');
      } else {
        throw new Error('Failed to create key');
      }
    } catch (error) {
      showMessage('Failed to create API key', 'error');
    } finally {
      setCreatingKey(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/api-keys?keyId=${keyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
        showMessage('API Key deleted', 'success');
      }
    } catch (error) {
      showMessage('Failed to delete API key', 'error');
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    showMessage('API key copied to clipboard', 'success');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-600">Manage your SDK authentication keys</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <p className="text-sm text-gray-600">Use these keys to authenticate SDK requests</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create New Key */}
          <div className="flex gap-2">
            <Input
              placeholder="Key name (e.g., Production, Development)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createApiKey()}
            />
            <Button onClick={createApiKey} disabled={creatingKey}>
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </div>

          {/* API Keys List */}
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Key className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-1">No API keys yet</p>
              <p className="text-sm text-gray-500">Create your first key to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-gray-500 font-mono">
                      {key.key || key.maskedKey}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {key.key && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(key.key, key.id)}
                      >
                        {copiedKey === key.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SDK Integration Example */}
          <div className="bg-gray-50 p-4 rounded-lg border mt-6">
            <div className="text-sm font-medium mb-2">SDK Integration</div>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import PromptCraft from 'promptcraft-sdk';

const promptcraft = new PromptCraft({
  apiKey: 'your-api-key-here'
});

// Track OpenAI calls
const start = Date.now();
const result = await openai.chat.completions.create(params);
await promptcraft.trackOpenAI(params, result, Date.now() - start);`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
