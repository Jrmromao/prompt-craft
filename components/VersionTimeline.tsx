import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Version {
  id: string;
  version: string;
  content: string;
  description?: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl: string | null;
  };
}

interface VersionTimelineProps {
  promptId: string;
}

export function VersionTimeline({ promptId }: VersionTimelineProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/versions`);
        if (response.ok) {
          const data = await response.json();
          setVersions(data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVersions();
  }, [promptId]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-500" />
          <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-semibold text-transparent">
            Version Timeline
          </h2>
        </div>
        <Button
          variant="outline"
          className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
          onClick={() => router.push(`/prompts/${promptId}/versioning`)}
        >
          Go to Versioning Page
        </Button>
      </div>
      <ol className="relative border-l-2 border-purple-200 dark:border-purple-800">
        {versions.map((version, idx) => (
          <li key={version.id} className="mb-10 ml-4">
            <div className="absolute -left-2.5 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full ring-4 ring-white dark:ring-zinc-900">
              <span className="text-xs font-bold text-white">{version.version}</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                {version.user?.imageUrl ? (
                  <AvatarImage src={version.user.imageUrl} alt={version.user.name || 'User'} />
                ) : (
                  <AvatarFallback>{version.user?.name?.[0] || '?'}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">Version {version.version}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {version.description || 'No description'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 px-2 text-xs text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  onClick={() => setExpanded(expanded === version.id ? null : version.id)}
                >
                  {expanded === version.id ? (
                    <>
                      <ChevronUp className="inline h-4 w-4 mr-1" /> Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="inline h-4 w-4 mr-1" /> Show Details
                    </>
                  )}
                </Button>
                {expanded === version.id && (
                  <div className="mt-2 rounded bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                    <div className="mb-2">
                      <span className="font-semibold">Content:</span>
                      <pre className="whitespace-pre-wrap break-words mt-1">{version.content}</pre>
                    </div>
                    <div>
                      <span className="font-semibold">Author:</span> {version.user?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span> {new Date(version.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
} 