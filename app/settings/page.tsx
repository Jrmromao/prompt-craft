'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Bell, CreditCard, Shield, Users, Copy, Check, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
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
      showMessage('Please enter a key name', true);
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
        showMessage('API Key created! Copy it now - you won\'t see it again.');
        setApiKeys([...apiKeys, data.key]);
        setNewKeyName('');
      } else {
        throw new Error('Failed to create key');
      }
    } catch (error) {
      showMessage('Failed to create API key', true);
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
        showMessage('API Key deleted');
      }
    } catch (error) {
      showMessage('Failed to delete API key', true);
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    showMessage('API key copied to clipboard');
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and API integration</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Use these keys to authenticate SDK requests</CardDescription>
              </div>
            </div>
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
                        {key.key ? key.key : maskKey(key.maskedKey || '')}
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
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm font-medium mb-2">SDK Integration</div>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import PromptCraft from 'promptcraft-sdk';

const promptcraft = new PromptCraft({
  apiKey: 'your-api-key-here'
});`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Link href="/settings/billing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>Current plan: Free (1,000 runs/month)</CardDescription>
                  </div>
                </div>
                <Button variant="ghost">Manage →</Button>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Email</Label>
                <div className="font-medium">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
              <div>
                <Label className="text-gray-600">Plan</Label>
                <div className="font-medium">Free</div>
              </div>
              <div>
                <Label className="text-gray-600">Member Since</Label>
                <div className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Usage This Month</Label>
                <div className="font-medium">0 / 1,000 runs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Contact support to delete your account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
