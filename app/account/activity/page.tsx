import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Activity History | Profile",
  description: "View your account activity history",
};

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Activity History</h1>
          </div>
          <p className="text-muted-foreground">
            View your recent account activity and actions
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Activity history coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 