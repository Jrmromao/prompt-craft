import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* NavBar Skeleton */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 pt-8">
        {/* Sidebar Skeleton */}
        <aside className="mt-4 hidden h-fit w-72 shrink-0 flex-col rounded-2xl border border-border bg-card px-6 py-8 md:flex">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8">
          {/* Profile Header Card Skeleton */}
          <Card className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg md:flex-row md:items-start">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>

          {/* Profile Form Skeleton */}
          <Card className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2].map(i => (
                    <div key={i}>
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
