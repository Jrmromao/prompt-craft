import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowRight, User } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Version {
  id: string;
  content: string;
  createdAt: Date;
  prompt: {
    user: {
      name: string | null;
      imageUrl: string | null;
    } | null;
  };
}

interface VersionDiffProps {
  version1: Version;
  version2: Version;
  diff: Array<{
    value: string;
    added: boolean;
    removed: boolean;
  }>;
}

export function VersionDiff({ version1, version2, diff }: VersionDiffProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(version2.content);
      setCopied(true);
      toast({
        title: "Success",
        description: "New version copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="space-y-1 text-center">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Previous Version</div>
            <Badge variant="outline" className="text-sm">
              {formatDate(version1.createdAt)}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground justify-center">
              <User className="w-4 h-4 mr-1" />
              <span>{version1.prompt.user?.name || 'Unknown User'}</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="space-y-1 text-center">
            <div className="text-xs font-semibold text-muted-foreground mb-1">New Version</div>
            <Badge variant="outline" className="text-sm">
              {formatDate(version2.createdAt)}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground justify-center">
              <User className="w-4 h-4 mr-1" />
              <span>{version2.prompt.user?.name || 'Unknown User'}</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center space-x-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy New Version</span>
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {diff.length > 0 ? (
            <div className="space-y-2">
              {diff.map((change, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    change.added
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : change.removed
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : ''
                  }`}
                >
                  {change.value}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No changes to show</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 