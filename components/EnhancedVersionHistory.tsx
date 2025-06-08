import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { History, Plus, GitCompare, Tag, MessageSquare } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedVersionDiff } from './EnhancedVersionDiff';

interface Version {
  id: string;
  version: string;
  content: string;
  description?: string;
  createdAt: string;
  commitMessage?: string;
  tags?: string[];
  user: {
    name: string | null;
    imageUrl: string | null;
  };
}

interface EnhancedVersionHistoryProps {
  id: string;
  onVersionSelect?: (version: Version) => void;
}

export function EnhancedVersionHistory({ id, onVersionSelect }: EnhancedVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
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

  const handleCreateVersion = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a commit message',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newVersionContent,
          description: newVersionDescription,
          commitMessage,
          tags: newTags,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'New version created successfully',
        });
        setIsCreateVersionOpen(false);
        // Refresh versions
        const versionsResponse = await fetch(`/api/prompts/${id}/versions`);
        if (versionsResponse.ok) {
          const data = await versionsResponse.json();
          setVersions(data);
        }
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create new version',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new version',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Version History</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateVersionOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Version</span>
        </Button>
      </div>

      <div className="space-y-4">
        {paginatedVersions.map((version, index) => (
          <Card key={version.id} className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {version.commitMessage || 'No commit message'}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{version.user.name || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {version.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    <span>{tag}</span>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openCompareDialog(version.id)}
                  className="flex items-center space-x-2"
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Compare</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRollback(version.id)}
                >
                  Rollback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pl-12">
                <p className="text-sm text-muted-foreground">{version.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Version Dialog */}
      <Dialog open={isCreateVersionOpen} onOpenChange={setIsCreateVersionOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of your prompt with a descriptive commit message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commit-message">Commit Message</Label>
              <Input
                id="commit-message"
                placeholder="Describe the changes in this version"
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newVersionContent}
                onChange={e => setNewVersionContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newVersionDescription}
                onChange={e => setNewVersionDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., production, stable, beta"
                value={newTags.join(', ')}
                onChange={e => setNewTags(e.target.value.split(',').map(tag => tag.trim()))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateVersionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>Create Version</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              Select two versions to compare their differences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Version 1</Label>
              <Select value={compareVersion1 || ''} onValueChange={setCompareVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.commitMessage || 'No commit message'} -{' '}
                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Version 2</Label>
              <Select value={compareVersion2 || ''} onValueChange={setCompareVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.commitMessage || 'No commit message'} -{' '}
                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCompareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompareSubmit}>Compare</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Version Comparison</DialogTitle>
          </DialogHeader>
          {comparison && (
            <EnhancedVersionDiff
              version1={comparison.version1}
              version2={comparison.version2}
              contentDiff={comparison.contentDiff}
              descriptionDiff={comparison.descriptionDiff}
              tagsDiff={comparison.tagsDiff}
              metadataDiff={comparison.metadataDiff}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 