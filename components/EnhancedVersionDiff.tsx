import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowRight, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

interface EnhancedVersionDiffProps {
  version1: any;
  version2: any;
  contentDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
  descriptionDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
  tagsDiff: { added: string[]; removed: string[] };
  metadataDiff: Array<{ key: string; oldVal: any; newVal: any }>;
}

export function EnhancedVersionDiff({
  version1,
  version2,
  contentDiff,
  descriptionDiff,
  tagsDiff,
  metadataDiff,
}: EnhancedVersionDiffProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(version2.content);
      setCopied(true);
      toast({
        title: 'Success',
        description: 'New version copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const renderDiffLines = (diffArr: any[], side: 'left' | 'right'): DiffLine[] => {
    let lineNumber = 1;
    return diffArr.map(part => {
      const lines = part.value.split('\n');
      return lines.map(line => {
        const diffLine: DiffLine = {
          type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
          content: line,
          lineNumber: lineNumber++,
        };
        return diffLine;
      });
    }).flat();
  };

  const renderDiffSection = (lines: DiffLine[], side: 'left' | 'right') => (
    <div className="font-mono text-sm">
      {lines.map((line, idx) => (
        <div
          key={idx}
          className={cn(
            'flex items-start',
            line.type === 'added' && 'bg-green-50 dark:bg-green-900/20',
            line.type === 'removed' && 'bg-red-50 dark:bg-red-900/20'
          )}
        >
          <div className="w-12 select-none border-r border-gray-200 pr-2 text-right text-gray-500 dark:border-gray-700">
            {line.lineNumber}
          </div>
          <div className="w-6 select-none text-center">
            {line.type === 'added' && '+'}
            {line.type === 'removed' && '-'}
          </div>
          <div
            className={cn(
              'flex-1 px-2',
              line.type === 'added' && 'text-green-700 dark:text-green-300',
              line.type === 'removed' && 'text-red-700 dark:text-red-300'
            )}
          >
            {line.content}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTags = (
    tags: string[],
    added: string[],
    removed: string[],
    side: 'left' | 'right'
  ) => (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <Badge
          key={tag + idx}
          className={cn(
            'transition-colors',
            side === 'left' && removed.includes(tag) && 'bg-red-100 text-red-700 line-through',
            side === 'right' && added.includes(tag) && 'bg-green-100 text-green-700',
            !removed.includes(tag) && !added.includes(tag) && 'bg-gray-100 text-gray-700'
          )}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="space-y-1 text-center">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Previous Version</div>
            <Badge variant="outline" className="text-sm">
              {formatDate(version1.createdAt)}
            </Badge>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <User className="mr-1 h-4 w-4" />
              <span>{version1.prompt?.user?.name || 'Unknown User'}</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1 text-center">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">New Version</div>
            <Badge variant="outline" className="text-sm">
              {formatDate(version2.createdAt)}
            </Badge>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <User className="mr-1 h-4 w-4" />
              <span>{version2.prompt?.user?.name || 'Unknown User'}</span>
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
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy New Version</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Content Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Content</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('content')}
              className="h-8 w-8 p-0"
            >
              {collapsedSections.has('content') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!collapsedSections.has('content') && (
              <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                {renderDiffSection(renderDiffLines(contentDiff, 'left'), 'left')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Content</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('content')}
              className="h-8 w-8 p-0"
            >
              {collapsedSections.has('content') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!collapsedSections.has('content') && (
              <div className="overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                {renderDiffSection(renderDiffLines(contentDiff, 'right'), 'right')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Tags</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('tags')}
              className="h-8 w-8 p-0"
            >
              {collapsedSections.has('tags') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!collapsedSections.has('tags') && (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Previous Tags</h4>
                  {renderTags(
                    version1.tags || [],
                    tagsDiff.added,
                    tagsDiff.removed,
                    'left'
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Tags</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('tags')}
              className="h-8 w-8 p-0"
            >
              {collapsedSections.has('tags') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {!collapsedSections.has('tags') && (
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">New Tags</h4>
                  {renderTags(
                    version2.tags || [],
                    tagsDiff.added,
                    tagsDiff.removed,
                    'right'
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 