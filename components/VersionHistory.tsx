"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch, GitCommit, History } from 'lucide-react';
import { toast } from 'sonner';
import { VersionComparisonDialog } from './VersionComparisonDialog';

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

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast.error('Failed to load version history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
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
      <div className="flex items-center gap-2">
        <History className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Version History</h2>
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
                        // TODO: Implement rollback
                        toast.info('Rollback functionality coming soon');
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
    </div>
  );
} 