'use client';

import { Filter } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (key: string, value: string) => void;
  currentFilters: {
    category?: string;
    sort?: string;
  };
}

export function SearchFilters({ onFilterChange, currentFilters }: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters:</span>
      </div>

      <select
        value={currentFilters.category || ''}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">All Categories</option>
        <option value="marketing">Marketing</option>
        <option value="content">Content</option>
        <option value="code">Code</option>
        <option value="business">Business</option>
        <option value="social">Social Media</option>
        <option value="ecommerce">E-commerce</option>
      </select>

      <select
        value={currentFilters.sort || 'relevance'}
        onChange={(e) => onFilterChange('sort', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="relevance">Most Relevant</option>
        <option value="popular">Most Popular</option>
        <option value="recent">Most Recent</option>
        <option value="upvotes">Most Upvoted</option>
      </select>
    </div>
  );
}
