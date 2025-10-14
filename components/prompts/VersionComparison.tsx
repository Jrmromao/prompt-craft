'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GitCompare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Version {
  id: string;
  content: string;
  createdAt: string;
  versionNumber: number;
}

interface VersionComparisonProps {
  promptId: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export function VersionComparison({ promptId }: VersionComparisonProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [version1, setVersion1] = useState<string>('');
  const [version2, setVersion2] = useState<string>('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
        // Auto-select latest two versions if available
        if (data.length >= 2) {
          setVersion1(data[0].id); // Latest
          setVersion2(data[1].id); // Previous
        }
      } else {
        toast.error('Failed to fetch versions');
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to fetch versions');
    } finally {
      setIsLoading(false);
    }
  };

  const compareVersions = async () => {
    if (!version1 || !version2) {
      toast.error('Please select two versions to compare');
      return;
    }

    if (version1 === version2) {
      toast.error('Please select different versions to compare');
      return;
    }

    setIsComparing(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version1,
          version2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiff(data.diff || []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to compare versions');
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
    } finally {
      setIsComparing(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, promptId]);

  const getVersionLabel = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    return version ? `v${version.versionNumber}` : 'Select version';
  };

  const getVersionDate = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    return version ? formatDistanceToNow(new Date(version.createdAt), { addSuffix: true }) : '';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare Versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Version Comparison
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Version Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Version 1</label>
              <Select value={version1} onValueChange={setVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={version.versionNumber === versions[0]?.versionNumber ? 'default' : 'secondary'}>
                          v{version.versionNumber}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {version1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getVersionDate(version1)}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Version 2</label>
              <Select value={version2} onValueChange={setVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant={version.versionNumber === versions[0]?.versionNumber ? 'default' : 'secondary'}>
                          v{version.versionNumber}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {version2 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getVersionDate(version2)}
                </p>
              )}
            </div>

            <Button 
              onClick={compareVersions} 
              disabled={!version1 || !version2 || version1 === version2 || isComparing}
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Comparing...
                </>
              ) : (
                'Compare'
              )}
            </Button>
          </div>

          {/* Comparison Result */}
          {diff.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Comparison: {getVersionLabel(version1)} ↔ {getVersionLabel(version2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {diff.map((line, index) => (
                      <div
                        key={index}
                        className={`${
                          line.type === 'added'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : line.type === 'removed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : 'text-muted-foreground'
                        } px-2 py-0.5`}
                      >
                        <span className="select-none mr-2">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        {line.content}
                      </div>
                    ))}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {versions.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              No versions available for comparison
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
