import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-12 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="mb-2 h-6 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Recent Prompts Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Credit History Skeleton */}
      <div>
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="mb-2 h-6 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
