'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ChevronDown, ChevronUp, Clock, User, History, PlusCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { Version } from '@/types/version';
import { PLANS, hasFeature, PlanType } from '@/app/constants/plans';

interface VersionTimelineProps {
  promptId: string;
  onVersionSelect: (version: Version) => void;
  selectedVersionId?: string;
  userPlan: string;
}

export function VersionTimeline({ promptId, onVersionSelect, selectedVersionId, userPlan }: VersionTimelineProps) {
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
      {versions.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Version History</h3>
          {(() => {
            const planTypeString = userPlan.toUpperCase();
            const planType = Object.values(PlanType).includes(planTypeString as PlanType) 
              ? planTypeString as PlanType 
              : PlanType.FREE;
            return hasFeature(PLANS[planType], 'Version Control');
          })() ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/prompts/${promptId}/versioning`)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Version
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/pricing')}
            >
              <Lock className="mr-2 h-4 w-4" />
              Upgrade to Create Versions
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg p-4 ${
                selectedVersionId === version.id ? 'border-purple-500' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Version {version.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                  {version.prompt?.user && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={version.prompt.user.imageUrl || undefined} />
                        <AvatarFallback>
                          {version.prompt.user.name?.[0] || version.prompt.user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {version.prompt.user.name || version.prompt.user.email}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(version.id)}
                  >
                    {expanded[version.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {expanded[version.id] && (
                <div className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {version.content}
                  </pre>
                  {onVersionSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => onVersionSelect(version)}
                    >
                      Select Version
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 