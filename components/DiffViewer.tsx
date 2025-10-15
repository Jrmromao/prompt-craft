'use client';

import { Version } from '@/types/version';
import { diffWords } from 'diff';
import { Card } from './ui/card';

interface DiffViewerProps {
  version1: Version | null;
  version2: Version | null;
}

export function DiffViewer({ version1, version2 }: DiffViewerProps) {
  if (!version1 || !version2) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-2">
          Select Versions to Compare
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose two different versions from the timeline to see their differences.
        </p>
      </div>
    );
  }

  const differences = diffWords(version1.content, version2.content);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
            v{version1.version}
          </span>
          <span className="text-gray-500">→</span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
            v{version2.version}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(version1.createdAt).toLocaleDateString()} → {new Date(version2.createdAt).toLocaleDateString()}
        </div>
      </div>

      <Card className="p-4 font-mono text-sm whitespace-pre-wrap">
        {differences.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : part.removed
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                : 'text-gray-700 dark:text-gray-300'
            }
          >
            {part.value}
          </span>
        ))}
      </Card>

      <div className="flex gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
          <span>Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
          <span>Removed</span>
        </div>
      </div>
    </div>
  );
} 