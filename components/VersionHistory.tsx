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
import { VersionTimeline } from './VersionTimeline';
import { Version } from '@/types/version';

interface VersionHistoryProps {
  id: string;
  onVersionSelect?: (version: Version) => void;
  initialData?: Version[];
}

export function VersionHistory({ id, onVersionSelect, initialData }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(initialData ? false : true);
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(undefined);
  const [comparison, setComparison] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [currentPromptData, setCurrentPromptData] = useState<any>(null);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [userPlan, setUserPlan] = useState<string>('FREE');
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
    if (initialData && initialData.length > 0) return; // Don't refetch if we have initial data
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}/versions`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load version history');
        }
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load version history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVersions();
  }, [id, toast, initialData]);

  useEffect(() => {
    const fetchCurrentPrompt = async () => {
      try {
        setIsLoadingPrompt(true);
        const response = await fetch(`/api/prompts/${id}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load current prompt data');
        }
        const data = await response.json();
        setCurrentPromptData(data);
        setNewVersionContent(data.content);
        setNewVersionDescription(data.description || '');
      } catch (error) {
        console.error('Error fetching current prompt:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load current prompt data',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPrompt(false);
      }
    };

    fetchCurrentPrompt();
  }, [id, toast]);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch('/api/user/plan');
        if (!response.ok) {
          throw new Error('Failed to fetch user plan');
        }
        const data = await response.json();
        setUserPlan(data.planType || 'FREE');
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setUserPlan('FREE');
      }
    };

    fetchUserPlan();
  }, []);

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
      <VersionTimeline
        promptId={id}
        onVersionSelect={handleVersionSelect}
        selectedVersionId={selectedVersion}
        userPlan={userPlan}
      />
      {isComparisonOpen && comparison && (
        <VersionComparisonDialog
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          comparison={comparison}
        />
      )}
      {isCreateVersionOpen && (
        <UpdatePromptDialog
          open={isCreateVersionOpen}
          onOpenChange={setIsCreateVersionOpen}
          content={newVersionContent}
          setContent={setNewVersionContent}
          description={newVersionDescription}
          setDescription={setNewVersionDescription}
          id={id}
          currentPrompt={currentPromptData}
          onSuccess={() => {
            setIsCreateVersionOpen(false);
            // Refresh versions
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
      )}
    </div>
  );
}
