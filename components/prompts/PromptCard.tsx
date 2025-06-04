"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star, Copy, ExternalLink } from "lucide-react";
import * as React from "react";

export default function PromptCard({ prompt, isFeatured }: { prompt: any; isFeatured: boolean }) {
  return (
    <div
      className="relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 focus-within:ring-2 focus-within:ring-purple-500"
      tabIndex={0}
    >
      {isFeatured && (
        <div className="absolute -top-4 left-4 flex items-center gap-2 z-10">
          <Badge className="bg-gradient-to-r from-purple-700 to-pink-600 text-white font-semibold px-3 py-1 rounded-full shadow border border-white dark:border-gray-900">Featured</Badge>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-pink-300">
        <Link href={`/community-prompts/${prompt.slug}`}>{prompt.name}</Link>
      </h2>
      <p className="text-gray-800 dark:text-gray-100 mb-3 line-clamp-3">{prompt.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {prompt.tags.map((tag: any) => (
          <Badge
            key={tag.id}
            className="bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100 font-medium border border-purple-300 dark:border-purple-700 hover:bg-purple-200 hover:text-purple-900 dark:hover:bg-purple-800 dark:hover:text-purple-100 cursor-default"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 mb-4">
        <span className="inline-flex items-center gap-1 text-purple-800 dark:text-purple-200 font-bold text-base">
          <Star className="w-4 h-4 fill-current text-yellow-400" />
          {prompt.upvotes}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">upvotes</span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={() => navigator.clipboard.writeText(prompt.description)}
          aria-label="Copy prompt description"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>
        <Link
          href={`/community-prompts/${prompt.slug}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-200 bg-white dark:bg-gray-900 font-medium shadow hover:bg-purple-50 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="View prompt details"
        >
          <ExternalLink className="w-4 h-4" /> Details
        </Link>
      </div>
    </div>
  );
} 