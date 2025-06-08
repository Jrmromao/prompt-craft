'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { History, Plus, GitCompare } from 'lucide-react';
import { VersionComparisonDialog } from './VersionComparisonDialog';
import { UpdatePromptDialog } from '@/components/prompts/UpdatePromptDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog as CompareDialog,
  DialogContent as CompareDialogContent,
  DialogHeader as CompareDialogHeader,
  DialogTitle as CompareDialogTitle,
  DialogDescription as CompareDialogDescription,
} from '@/components/ui/dialog';

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
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const VERSIONS_PER_PAGE = 4;
  const totalPages = Math.ceil(versions.length / VERSIONS_PER_PAGE);
  const paginatedVersions = versions.slice(
    (currentPage - 1) * VERSIONS_PER_PAGE,
    currentPage * VERSIONS_PER_PAGE
  );
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load version history. Please try again later.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again later.',
          variant: 'destructive',
        });
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
          toast({
            title: 'Error',
            description: 'Failed to load current prompt data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching current prompt:', error);
        toast({
          title: 'Error',
          description: 'Failed to load current prompt data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    fetchCurrentPrompt();
  }, [id]);

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version.id);
    onVersionSelect?.(version);
  };

  const openCompareDialog = (defaultVersionId: string) => {
    setCompareVersion1(defaultVersionId);
    setCompareVersion2(versions[0]?.id || null);
    setIsCompareDialogOpen(true);
  };

  const handleCompareSubmit = async () => {
    if (!compareVersion1 || !compareVersion2 || compareVersion1 === compareVersion2) {
      toast({
        title: 'Error',
        description: 'Please select two different versions to compare.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const v1 = versions.find(v => v.id === compareVersion1);
      const v2 = versions.find(v => v.id === compareVersion2);
      if (!v1 || !v2) {
        toast({
          title: 'Error',
          description: 'Could not find versions to compare',
          variant: 'destructive',
        });
        return;
      }
      const response = await fetch(`/api/prompts/${id}/versions/${v1.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compareWith: v2.id }),
      });
      if (response.ok) {
        const comparison = await response.json();
        setComparison(comparison);
        setIsComparisonOpen(true);
        setIsCompareDialogOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to compare versions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to compare versions',
        variant: 'destructive',
      });
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
        toast({
          title: 'Success',
          description: 'Successfully rolled back to the selected version.',
        });
        const fetchVersions = async () => {
          const response = await fetch(`/api/prompts/${id}/versions`);
          if (response.ok) {
            const data = await response.json();
            setVersions(data);
          }
        };
        fetchVersions();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to rollback. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rolling back:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: 'Copied!',
        description: 'Version content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-semibold text-transparent">
            Version History
          </h2>
        </div>
        <Button
          onClick={() => setIsCreateVersionOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/20"
          disabled={isLoadingPrompt}
        >
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      <div className="space-y-6">
        {paginatedVersions.map((version, index) => (
          <Card
            key={version.id}
            className={`cursor-pointer rounded-xl border bg-white shadow-sm transition-all dark:bg-zinc-900/80 ${
              selectedVersion === version.id
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 ring-2 ring-purple-500/20 dark:from-purple-900/20 dark:to-pink-900/20'
                : 'border-zinc-200 hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-purple-700'
            }`}
            style={{ minHeight: 90 }}
            onClick={() => handleVersionSelect(version)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2 pt-4">
              <CardTitle className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                Version {version.version}
              </CardTitle>
              <Badge
                variant="outline"
                className="ml-2 border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400"
              >
                {formatDistanceToNow(new Date(version.createdAt), {
                  addSuffix: true,
                })}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between px-6 pb-4 pt-0">
              <div className="max-w-xs truncate text-sm text-muted-foreground">
                {version.description ||
                  version.content.slice(0, 60) + (version.content.length > 60 ? '...' : '')}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  onClick={e => {
                    e.stopPropagation();
                    handleCopy(version.content);
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  onClick={e => {
                    e.stopPropagation();
                    openCompareDialog(version.id);
                  }}
                >
                  <GitCompare className="mr-1 h-4 w-4" />
                  Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 border-t border-zinc-200 bg-background pt-4 dark:border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-2 text-sm text-purple-600 dark:text-purple-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-md border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

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

      {/* Compare Dialog */}
      <CompareDialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <CompareDialogContent className="max-w-md">
          <CompareDialogHeader>
            <CompareDialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent">
              Compare Any Two Versions
            </CompareDialogTitle>
            <CompareDialogDescription>
              Select two different versions to compare their changes.
            </CompareDialogDescription>
          </CompareDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Version 1</Label>
              <Select value={compareVersion1 ?? undefined} onValueChange={setCompareVersion1}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      Version {v.version} (
                      {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Version 2</Label>
              <Select value={compareVersion2 ?? undefined} onValueChange={setCompareVersion2}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      Version {v.version} (
                      {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCompareDialogOpen(false)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompareSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              Compare
            </Button>
          </div>
        </CompareDialogContent>
      </CompareDialog>
    </div>
  );
}
