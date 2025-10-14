'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { History, Eye, GitBranch, GitCompare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VersionComparison } from './VersionComparison';

interface Version {
  id: string;
  content: string;
  createdAt: string;
  versionNumber: number;
}

interface VersionManagerProps {
  promptId: string;
}

export function VersionManager({ promptId }: VersionManagerProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
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

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, promptId]);

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Versions
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Version History ({versions.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">
            {/* Version List */}
            <div>
              <h3 className="font-semibold mb-3">Versions</h3>
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <Card
                        key={version.id}
                        className={`cursor-pointer transition-colors ${
                          selectedVersion?.id === version.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={version.versionNumber === 1 ? 'default' : 'secondary'}>
                              v{version.versionNumber}
                              {version.versionNumber === versions[0]?.versionNumber && ' (Latest)'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVersion(version);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {version.content.length} characters
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {versions.length === 0 && !isLoading && (
                      <div className="text-center text-muted-foreground py-8">
                        No versions found
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Version Content */}
            <div>
              <h3 className="font-semibold mb-3">
                {selectedVersion ? `Version ${selectedVersion.versionNumber} Content` : 'Select a version'}
              </h3>
              <ScrollArea className="h-full">
                {selectedVersion ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Version {selectedVersion.versionNumber}
                        {selectedVersion.versionNumber === versions[0]?.versionNumber && (
                          <Badge className="ml-2">Current</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(selectedVersion.createdAt), { addSuffix: true })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {selectedVersion.content}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a version to view its content
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Button */}
      <VersionComparison promptId={promptId} />
    </div>
  );
}
