'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
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

export function SettingsClient() {
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
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setNewKeyName('');
        fetchKeys();
        toast.success('API key created successfully');
      } else {
        toast.error('Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async () => {
    if (!deleteKeyId) return;

    try {
      const res = await fetch(`/api/settings/api-keys?id=${deleteKeyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== deleteKeyId));
        toast.success('API key deleted');
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Failed to delete key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setDeleteKeyId(null);
      setDeleteKeyName('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your API keys and account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Key name (e.g., Production)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createKey()}
              />
              <Button onClick={createKey} disabled={creating}>
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </div>
          </div>

          {newKey && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">Save this key now!</p>
                  <p className="text-sm text-yellow-700">
                    You won't be able to see it again.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <code className="flex-1 p-2 bg-white border rounded text-sm break-all">
                  {newKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newKey, 'new')}
                >
                  {copiedId === 'new' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setNewKey(null)}
              >
                Dismiss
              </Button>
            </div>
          )}

          {keys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API keys"
              description="Create your first API key to get started"
            />
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeleteKeyId(key.id);
                      setDeleteKeyName(key.name);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteKeyName}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteKey} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
