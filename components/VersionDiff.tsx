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
  version1: any;
  version2: any;
  contentDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
  descriptionDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
  tagsDiff: { added: string[]; removed: string[] };
  metadataDiff: Array<{ key: string; oldVal: any; newVal: any }>;
}

export function VersionDiff({ version1, version2, contentDiff, descriptionDiff, tagsDiff, metadataDiff }: VersionDiffProps) {
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

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Helper to render diff as HTML with highlights
  const renderDiff = (diffArr: any[], side: 'left' | 'right') => (
    <div className="whitespace-pre-wrap text-sm">
      {diffArr.map((part, idx) => {
        if (side === 'left' && part.removed) {
          return <span key={idx} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 line-through">{part.value}</span>;
        }
        if (side === 'right' && part.added) {
          return <span key={idx} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">{part.value}</span>;
        }
        if (!part.added && !part.removed) {
          return <span key={idx}>{part.value}</span>;
        }
        return null;
      })}
    </div>
  );

  // Helper to render tags
  const renderTags = (tags: string[], added: string[], removed: string[], side: 'left' | 'right') => (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => {
        if (side === 'left' && removed.includes(tag)) {
          return <Badge key={tag + idx} className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700 line-through">{tag}</Badge>;
        }
        if (side === 'right' && added.includes(tag)) {
          return <Badge key={tag + idx} className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700">{tag}</Badge>;
        }
        return <Badge key={tag + idx} className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">{tag}</Badge>;
      })}
    </div>
  );

  // Helper to render metadata
  const renderMetadata = (meta: any, metaDiff: any[], side: 'left' | 'right') => {
    if (!meta) return <span className="text-muted-foreground">No metadata</span>;
    return (
      <div className="space-y-1 text-sm">
        {Object.entries(meta).map(([key, value]) => {
          const diff = metaDiff.find(d => d.key === key);
          if (diff) {
            if (side === 'left' && JSON.stringify(diff.oldVal) !== JSON.stringify(diff.newVal)) {
              return <div key={key} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 line-through p-1 rounded">{key}: {JSON.stringify(value)}</div>;
            }
            if (side === 'right' && JSON.stringify(diff.oldVal) !== JSON.stringify(diff.newVal)) {
              return <div key={key} className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 p-1 rounded">{key}: {JSON.stringify(value)}</div>;
            }
          }
          return <div key={key}>{key}: {JSON.stringify(value)}</div>;
        })}
      </div>
    );
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
              <span>{version1.prompt?.user?.name || 'Unknown User'}</span>
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

      {/* Aligned side-by-side comparison grid */}
      <div className="grid grid-cols-2 grid-rows-4 gap-6 items-stretch">
        {/* Content Row */}
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Content</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderDiff(contentDiff, 'left')}</CardContent></Card></div>
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Content</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderDiff(contentDiff, 'right')}</CardContent></Card></div>
        {/* Description Row */}
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Description</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderDiff(descriptionDiff, 'left')}</CardContent></Card></div>
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Description</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderDiff(descriptionDiff, 'right')}</CardContent></Card></div>
        {/* Tags Row */}
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Tags</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderTags(version1.tags || [], tagsDiff.added, tagsDiff.removed, 'left')}</CardContent></Card></div>
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Tags</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderTags(version2.tags || [], tagsDiff.added, tagsDiff.removed, 'right')}</CardContent></Card></div>
        {/* Metadata Row */}
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Metadata</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderMetadata(version1.metadata, metadataDiff, 'left')}</CardContent></Card></div>
        <div className="flex flex-col h-full"><Card className="h-full flex flex-col"><CardHeader><CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Metadata</CardTitle></CardHeader><CardContent className="flex-1 flex items-start">{renderMetadata(version2.metadata, metadataDiff, 'right')}</CardContent></Card></div>
      </div>
    </div>
  );
} 