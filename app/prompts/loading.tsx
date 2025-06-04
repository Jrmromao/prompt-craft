import { Skeleton } from "@/components/ui/skeleton";

export default function PromptsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-48 mb-4" />
        <Skeleton className="h-6 w-64" />
      </div>

      {/* Search and Filter Skeleton */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full md:w-96" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Prompts Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 