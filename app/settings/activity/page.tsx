import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { AuditService } from "@/lib/services/auditService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ActivityIcon } from "lucide-react";
import { ActivityList } from "@/components/settings/activity-list";

export const metadata: Metadata = {
  title: "Activity History | Settings",
  description: "View your account activity history",
};

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const activities = await AuditService.getInstance().getAuditLogs(userId, {
    limit: 50,
  });

  return (
    <div className="container max-w-4xl py-8">
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
          <ActivityList activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
} 