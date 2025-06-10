'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ChevronDown, ChevronUp, Clock, User, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface Version {
  id: string;
  version: number;
  content: string;
  createdAt: Date;
  user?: {
    name?: string;
    imageUrl?: string;
  };
}

interface VersionTimelineProps {
  promptId: string;
  onVersionSelect?: (version: Version) => void;
  selectedVersionId?: string;
}

export function VersionTimeline({ promptId, onVersionSelect, selectedVersionId }: VersionTimelineProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };

    fetchVersions();
  }, [promptId]);

  const toggleExpand = (versionId: string) => {
    setExpanded(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };

  if (!versions.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No version history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold">Version History</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
          onClick={() => router.push(`/prompts/${promptId}/version`)}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          View Full History
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`relative ${
                index !== versions.length - 1 ? 'pb-8' : ''
              }`}
            >
              {/* Timeline line */}
              {index !== versions.length - 1 && (
                <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200 dark:bg-gray-800" />
              )}

              <Card
                className={`relative overflow-hidden transition-all duration-200 cursor-pointer ${
                  selectedVersionId === version.id
                    ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/30'
                    : 'hover:border-purple-200 hover:bg-purple-50/50 dark:hover:border-purple-800 dark:hover:bg-purple-900/20'
                }`}
                onClick={() => onVersionSelect?.(version)}
              >
                <div className="p-4">
                  {/* Version header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        <GitBranch className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Version {version.version}</span>
                          {selectedVersionId === version.id && (
                            <Badge 
                              variant="secondary" 
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(version.id);
                      }}
                    >
                      {expanded[version.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Version details */}
                  {expanded[version.id] && (
                    <div className="mt-4 space-y-4 border-t pt-4 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={version.user?.imageUrl} />
                          <AvatarFallback>
                            {version.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {version.user?.name || 'Unknown User'}
                        </span>
                      </div>
                      <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-900">
                        <p className="line-clamp-3 text-muted-foreground">
                          {version.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 