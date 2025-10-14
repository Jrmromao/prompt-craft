'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { History, GitBranch, Crown, Plus, Clock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Version {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface VersionControlProps {
  promptId: string;
  currentContent: string;
  onVersionSelect: (content: string) => void;
  userPlan: 'FREE' | 'PRO';
  versionsUsed: number;
  maxVersions: number;
}

export function VersionControl({ 
  promptId, 
  currentContent, 
  onVersionSelect, 
  userPlan,
  versionsUsed,
  maxVersions 
}: VersionControlProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [promptId]);

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

  const createVersion = async () => {
    if (userPlan === 'FREE' && versions.length >= maxVersions) {
      toast.error(`Free users can create up to ${maxVersions} versions per prompt. Upgrade to PRO for unlimited versions!`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent })
      });

      if (response.ok) {
        toast.success('Version saved!');
        fetchVersions();
      } else {
        const error = await response.json();
        if (error.code === 'VERSION_LIMIT_REACHED') {
          toast.error(error.error);
        } else {
          toast.error('Failed to save version');
        }
      }
    } catch (error) {
      toast.error('Error saving version');
    } finally {
      setIsLoading(false);
    }
  };

  const selectVersion = (version: Version) => {
    setSelectedVersion(version.id);
    onVersionSelect(version.content);
    toast.success('Version loaded');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-fit" data-testid="version-control">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </div>
          <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'}>
            {userPlan === 'FREE' ? `${versions.length}/${maxVersions}` : 'Unlimited'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={createVersion}
            disabled={isLoading || (userPlan === 'FREE' && versions.length >= maxVersions)}
            data-testid="save-version-button"
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Current Version
          </Button>
          
          <Link href={`/prompts/${promptId}/edit`}>
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              New Version
            </Button>
          </Link>
        </div>

        {userPlan === 'FREE' && versions.length >= maxVersions && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
            <div className="text-center space-y-3">
              <Crown className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <h4 className="font-bold text-amber-800 mb-1">Version Limit Reached</h4>
                <p className="text-xs text-amber-700 mb-3">
                  You've used all 3 FREE versions. Upgrade for unlimited versions + advanced features.
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                  onClick={() => window.location.href = '/pricing'}
                >
                  Upgrade to PRO - $35/month
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No versions saved yet
            </p>
          ) : (
            versions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                  selectedVersion === version.id && "border-primary bg-primary/5"
                )}
                onClick={() => selectVersion(version)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3 h-3" />
                    <span className="text-sm font-medium">
                      Version {versions.length - index}
                    </span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">Latest</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(version.createdAt)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {version.content.slice(0, 100)}...
                </p>
              </div>
            ))
          )}
        </div>

        {userPlan === 'FREE' && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            💡 PRO users get unlimited versions + diff comparison
          </div>
        )}
      </CardContent>
    </Card>
  );
}
