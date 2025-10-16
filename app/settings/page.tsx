'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [deleteKeyName, setDeleteKeyName] = useState<string>('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      
      if (data.key) {
        setNewKey(data.key.key); // Get the actual key string from the response
        setNewKeyName('');
        await fetchKeys(); // Wait for keys to refresh
      }
    } catch (error) {
      console.error('Failed to create key:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await fetch(`/api/settings/api-keys?keyId=${id}`, { method: 'DELETE' });
      fetchKeys();
      setDeleteKeyId(null);
    } catch (error) {
      console.error('Failed to delete key:', error);
    }
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">💡 Set up email alerts</p>
              <p className="text-sm text-gray-600">Get notified when costs spike or errors increase</p>
            </div>
            <Link href="/settings/alerts">
              <Button variant="outline">Configure Alerts</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* New Key Alert */}
      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-green-900 mb-2">✅ API Key Created!</h3>
            <p className="text-sm text-green-800 mb-3">
              Copy this key now. You won't be able to see it again.
            </p>
            <div className="flex gap-2">
              <Input
                value={newKey}
                readOnly
                className="font-mono text-sm bg-white"
              />
              <Button
                onClick={() => copyKey(newKey, 'new')}
                variant="outline"
              >
                {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={() => setNewKey(null)}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your API Keys</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Use these keys to integrate the PromptCraft SDK in your applications</p>
            </div>
            <Button onClick={() => document.getElementById('create-key')?.scrollIntoView({ behavior: 'smooth' })}>
              <Plus className="w-4 h-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : keys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API Keys"
              description="Create your first API key to start using the PromptCraft SDK and save 50-80% on AI costs"
              actionLabel="Create Key"
              actionHref="#create-key"
              secondaryActionLabel="View Docs"
              secondaryActionHref="/docs/quickstart"
            />
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-gray-600 font-mono">{key.key}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeleteKeyId(key.id);
                        setDeleteKeyName(key.name);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Key */}
      <Card id="create-key">
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key Name</label>
              <Input
                placeholder="e.g., Production, Development"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createKey()}
              />
            </div>
            <Button onClick={createKey} disabled={!newKeyName.trim() || creating}>
              {creating ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">🔒 Security Notice</p>
              <p className="text-blue-800">
                For security reasons, API keys are only shown once at creation. If you lose a key, delete it and create a new one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={(open) => !open && setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete <strong>{deleteKeyName}</strong>?</p>
              <p className="text-red-600 font-medium">
                This action cannot be undone. Any applications using this key will stop working immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteKeyId && deleteKey(deleteKeyId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
