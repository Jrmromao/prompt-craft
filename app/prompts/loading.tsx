import { Skeleton } from '@/components/ui/skeleton';

export default function PromptsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-12 w-48" />
        <Skeleton className="h-6 w-64" />
      </div>

      {/* Search and Filter Skeleton */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <Skeleton className="h-10 w-full md:w-96" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Prompts Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-3/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-2/3" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
