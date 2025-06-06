"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch, GitCommit, History, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { VersionComparisonDialog } from './VersionComparisonDialog';
import { UpdatePromptDialog } from '@/components/prompts/UpdatePromptDialog';

interface Version {
  id: string;
  version: string;
  content: string;
  description?: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl: string | null;
  };
}

interface VersionHistoryProps {
  id: string;
  onVersionSelect?: (version: Version) => void;
}

export function VersionHistory({ id, onVersionSelect }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [currentPromptData, setCurrentPromptData] = useState<any>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        } else {
          toast.error('Failed to load version history. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [id]);

  useEffect(() => {
    const fetchCurrentPrompt = async () => {
      try {
        setIsLoadingPrompt(true);
        const response = await fetch(`/api/prompts/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPromptData(data);
          setNewVersionContent(data.content);
          setNewVersionDescription(data.description || '');
        } else {
          toast.error('Failed to load current prompt data');
        }
      } catch (error) {
        console.error('Error fetching current prompt:', error);
        toast.error('Failed to load current prompt data');
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    fetchCurrentPrompt();
  }, [id]);

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version.version);
    onVersionSelect?.(version);
  };

  const handleCompare = async (version1: string, version2: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}/versions/${version1}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compareWith: version2 }),
      });

      if (response.ok) {
        const comparison = await response.json();
        setComparison(comparison);
        setIsComparisonOpen(true);
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
    }
  };

  const handleRollback = async (version: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });

      if (response.ok) {
        toast.success('Successfully rolled back to the selected version.');
        const fetchVersions = async () => {
          const response = await fetch(`/api/prompts/${id}/versions`);
          if (response.ok) {
            const data = await response.json();
            setVersions(data);
          }
        };
        fetchVersions();
      } else {
        toast.error('Failed to rollback. Please try again later.');
      }
    } catch (error) {
      console.error('Error rolling back:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Version History</h2>
        </div>
        <Button 
          onClick={() => setIsCreateVersionOpen(true)}
          className="flex items-center gap-2"
          disabled={isLoadingPrompt}
        >
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <Card
            key={version.id}
            className={`cursor-pointer transition-colors ${
              selectedVersion === version.version
                ? 'border-primary'
                : 'hover:border-gray-300'
            }`}
            onClick={() => handleVersionSelect(version)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Version {version.version}
              </CardTitle>
              <Badge variant="outline">
                {formatDistanceToNow(new Date(version.createdAt), {
                  addSuffix: true,
                })}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {version.description && (
                  <p className="text-sm text-muted-foreground">
                    {version.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitCommit className="h-4 w-4" />
                  <span>By {version.user.name || 'Anonymous'}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompare(version.version, versions[0].version);
                    }}
                  >
                    Compare with Latest
                  </Button>
                  {selectedVersion === version.version && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRollback(version.version);
                      }}
                    >
                      Rollback to This Version
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <VersionComparisonDialog
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        comparison={comparison}
      />

      <UpdatePromptDialog
        open={isCreateVersionOpen}
        onOpenChange={setIsCreateVersionOpen}
        content={newVersionContent}
        setContent={setNewVersionContent}
        description={newVersionDescription}
        setDescription={setNewVersionDescription}
        promptId={id}
        currentPrompt={currentPromptData}
        onSuccess={() => {
          const fetchVersions = async () => {
            const response = await fetch(`/api/prompts/${id}/versions`);
            if (response.ok) {
              const data = await response.json();
              setVersions(data);
            }
          };
          fetchVersions();
        }}
      />
    </div>
  );
} 