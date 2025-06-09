'use client';

import { VersionTimeline } from '@/components/VersionTimeline';
import { DiffViewer } from '@/components/DiffViewer';
import { VersionPlayground } from '@/components/VersionPlayground';
import { VersionWarningDialog } from '@/components/VersionWarningDialog';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Version } from '@/types/version';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Gravatar } from '@/components/Gravatar';
import { toast } from 'sonner';

export default function VersioningPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params?.id as string;
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion1, setSelectedVersion1] = useState<Version | null>(null);
  const [selectedVersion2, setSelectedVersion2] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayground, setShowPlayground] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningDialogAction, setWarningDialogAction] = useState<'create' | 'clear' | 'select'>('create');

  const fetchVersions = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (promptId) fetchVersions();
  }, [promptId]);

  const handleCreateVersion = async (data: {
    content: string;
    description: string;
    commitMessage: string;
    tags: string[];
  }) => {
    try {
      console.log('Creating new version with data:', data);
      console.log('Prompt ID:', promptId);
      
      const response = await fetch(`/api/prompts/${promptId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create version:', errorData);
        throw new Error(errorData.error || 'Failed to create new version');
      }

      await fetchVersions();
      toast.success('New version created successfully');
      setShowPlayground(false);
      // Clear selected versions after creating a new one
      setSelectedVersion1(null);
      setSelectedVersion2(null);
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to create new version');
      throw error;
    }
  };

  const handleTestPrompt = async (content: string, testInput?: string) => {
    try {
      const response = await fetch('/api/prompts/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, testInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to test prompt');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error('Failed to test prompt');
      throw error;
    }
  };

  const handleVersionSelect = (version: Version) => {
    if (showPlayground) {
      // If we're in playground mode, just ignore the selection
      return;
    }

    if (selectedVersion1?.id === version.id) {
      setSelectedVersion1(null);
    } else if (selectedVersion2?.id === version.id) {
      setSelectedVersion2(null);
    } else if (!selectedVersion1) {
      setSelectedVersion1(version);
    } else if (!selectedVersion2) {
      setSelectedVersion2(version);
    }
  };

  const handleNewVersionClick = () => {
    // Clear selected versions and show playground without warning
    setSelectedVersion1(null);
    setSelectedVersion2(null);
    setShowPlayground(true);
  };

  const handleWarningDialogCompare = () => {
    setShowWarningDialog(false);
    setShowPlayground(false);
  };

  const handleWarningDialogCreate = () => {
    setShowWarningDialog(false);
    setShowPlayground(true);
    // Clear selected versions when creating a new version
    setSelectedVersion1(null);
    setSelectedVersion2(null);
  };

  const handleWarningDialogSelect = () => {
    setShowWarningDialog(false);
    setShowPlayground(false);
  };

  const handleWarningDialogClear = () => {
    setShowWarningDialog(false);
    setSelectedVersion1(null);
    setSelectedVersion2(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 min-h-screen bg-background">
      {/* Left: Version List/Timeline with selection controls */}
      <div className="md:w-1/3 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <ArrowLeft className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Versioning
            </h1>
          </div>
          <Button
            onClick={handleNewVersionClick}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            New Version
          </Button>
        </div>
        <div className="mb-4 text-sm text-muted-foreground">
          Select any two versions to compare.
        </div>
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                (selectedVersion1?.id === version.id || selectedVersion2?.id === version.id)
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
              onClick={() => handleVersionSelect(version)}
            >
              <input
                type="checkbox"
                checked={selectedVersion1?.id === version.id || selectedVersion2?.id === version.id}
                onChange={() => handleVersionSelect(version)}
                className="accent-purple-600"
                disabled={Boolean(
                  selectedVersion1 && selectedVersion2 &&
                  !(selectedVersion1.id === version.id || selectedVersion2.id === version.id)
                )}
              />
              <Gravatar 
                email={version.prompt?.user?.email ?? 'anonymous@example.com'} 
                size={24}
                className="flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">v{version.version}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {version.prompt?.user?.name ?? 'Anonymous'}
                  </span>
                </div>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {version.description || 'No description'}
                </span>
              </div>
              <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                {new Date(version.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Diff Viewer or Playground */}
      <div className="md:w-2/3 w-full bg-white dark:bg-zinc-900/60 rounded-xl shadow p-6 min-h-[400px]">
        {showPlayground ? (
          <VersionPlayground
            currentVersion={versions[versions.length - 1]}
            onSaveVersion={handleCreateVersion}
            onTestPrompt={handleTestPrompt}
          />
        ) : (
          <DiffViewer version1={selectedVersion1} version2={selectedVersion2} />
        )}
      </div>

      <VersionWarningDialog
        isOpen={showWarningDialog}
        onClose={() => setShowWarningDialog(false)}
        onCompare={warningDialogAction === 'create' ? handleWarningDialogCompare : 
                  warningDialogAction === 'select' ? handleWarningDialogSelect :
                  handleWarningDialogClear}
        onCreate={warningDialogAction === 'create' ? handleWarningDialogCreate : undefined}
        action={warningDialogAction}
      />
    </div>
  );
} 