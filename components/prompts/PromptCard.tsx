'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import * as React from 'react';

export default function PromptCard({ prompt, isFeatured }: { prompt: any; isFeatured: boolean }) {
  return (
    <div
      className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
      tabIndex={0}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-4 z-10 flex items-center gap-2">
          <Badge className="rounded-full border border-white bg-gradient-to-r from-blue-700 to-blue-500 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
            Featured
          </Badge>
        </div>
      )}
      <h2 className="mb-2 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold text-transparent dark:from-blue-300 dark:to-blue-300">
        <Link href={`/community-prompts/${prompt.slug}`}>{prompt.name}</Link>
      </h2>
      <p className="mb-3 line-clamp-3 text-gray-800 dark:text-gray-100">{prompt.description}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {prompt.tags.map((tag: any) => (
          <Badge
            key={tag.id}
            className="cursor-default border border-blue-300 bg-blue-200 font-medium text-blue-900 hover:bg-blue-200 hover:text-blue-900 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-800 dark:hover:text-blue-100"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            {prompt.upvotes}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            {prompt._count?.comments || 0}
          </div>
        </div>
      </div>
      <div className="mt-auto flex gap-2">
        <button
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 font-medium text-white shadow hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => navigator.clipboard.writeText(prompt.description)}
          aria-label="Copy prompt description"
        >
          <Copy className="h-4 w-4" /> Copy
        </button>
        <Link
          href={`/community-prompts/${prompt.slug}`}
          className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 font-medium text-blue-700 shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-blue-800"
          aria-label="View prompt details"
        >
          <ExternalLink className="h-4 w-4" /> Details
        </Link>
      </div>
    </div>
  );
}
