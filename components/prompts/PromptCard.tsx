'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, ExternalLink } from 'lucide-react';
import * as React from 'react';

export default function PromptCard({ prompt, isFeatured }: { prompt: any; isFeatured: boolean }) {
  return (
    <div
      className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500 hover:-translate-y-2 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
      tabIndex={0}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-4 z-10 flex items-center gap-2">
          <Badge className="rounded-full border border-white bg-gradient-to-r from-purple-700 to-pink-600 px-3 py-1 font-semibold text-white shadow dark:border-gray-900">
            Featured
          </Badge>
        </div>
      )}
      <h2 className="mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-xl font-bold text-transparent dark:from-purple-300 dark:to-pink-300">
        <Link href={`/community-prompts/${prompt.slug}`}>{prompt.name}</Link>
      </h2>
      <p className="mb-3 line-clamp-3 text-gray-800 dark:text-gray-100">{prompt.description}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {prompt.tags.map((tag: any) => (
          <Badge
            key={tag.id}
            className="cursor-default border border-purple-300 bg-purple-200 font-medium text-purple-900 hover:bg-purple-200 hover:text-purple-900 dark:border-purple-700 dark:bg-purple-800 dark:text-purple-100 dark:hover:bg-purple-800 dark:hover:text-purple-100"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <div className="mb-4 mt-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-base font-bold text-purple-800 dark:text-purple-200">
          <Star className="h-4 w-4 fill-current text-yellow-400" />
          {prompt.upvotes}
        </span>
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">upvotes</span>
      </div>
      <div className="mt-auto flex gap-2">
        <button
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 font-medium text-white shadow hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={() => navigator.clipboard.writeText(prompt.description)}
          aria-label="Copy prompt description"
        >
          <Copy className="h-4 w-4" /> Copy
        </button>
        <Link
          href={`/community-prompts/${prompt.slug}`}
          className="flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-3 py-1.5 font-medium text-purple-700 shadow hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-700 dark:bg-gray-900 dark:text-purple-200 dark:hover:bg-purple-800"
          aria-label="View prompt details"
        >
          <ExternalLink className="h-4 w-4" /> Details
        </Link>
      </div>
    </div>
  );
}
