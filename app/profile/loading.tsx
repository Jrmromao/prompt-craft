import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

      <div className="flex w-full max-w-7xl mx-auto pt-8 px-4 gap-8">
        {/* Sidebar Skeleton */}
        <aside className="w-72 shrink-0 hidden md:flex flex-col bg-card rounded-2xl py-8 px-6 h-fit mt-4 border border-border">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col gap-8">
          {/* Profile Header Card Skeleton */}
          <Card className="relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 p-8 bg-card border border-border rounded-2xl shadow-lg">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>

          {/* Profile Form Skeleton */}
          <Card className="p-8 bg-card border border-border rounded-2xl shadow-lg">
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
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
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32 mt-2" />
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