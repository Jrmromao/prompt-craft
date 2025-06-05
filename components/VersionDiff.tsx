import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit } from 'lucide-react';

interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
}

interface VersionDiffProps {
  version1: {
    version: string;
    content: string;
    createdAt: string;
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  };
  version2: {
    version: string;
    content: string;
    createdAt: string;
    user: {
      name: string | null;
      imageUrl: string | null;
    };
  };
  diff: DiffChange[];
}

export function VersionDiff({ version1, version2, diff }: VersionDiffProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-medium">Version {version1.version}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitCommit className="h-4 w-4" />
              <span>By {version1.user.name || 'Anonymous'}</span>
              <Badge variant="outline">
                {formatDistanceToNow(new Date(version1.createdAt), {
                  addSuffix: true,
                })}
              </Badge>
            </div>
          </div>
          <div className="text-muted-foreground">→</div>
          <div>
            <h3 className="font-medium">Version {version2.version}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitCommit className="h-4 w-4" />
              <span>By {version2.user.name || 'Anonymous'}</span>
              <Badge variant="outline">
                {formatDistanceToNow(new Date(version2.createdAt), {
                  addSuffix: true,
                })}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm whitespace-pre-wrap">
            {diff.map((change, index) => (
              <span
                key={index}
                className={`${
                  change.added
                    ? 'bg-green-100 dark:bg-green-900'
                    : change.removed
                    ? 'bg-red-100 dark:bg-red-900'
                    : ''
                }`}
              >
                {change.value}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 