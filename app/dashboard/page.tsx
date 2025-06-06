import DashboardClient from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";
import { DashboardService } from "@/lib/services/dashboardService";
import { currentUser } from "@clerk/nextjs/server";
import { AdminPromptReviewDialog } from '@/components/dashboard/AdminPromptReviewDialog';

// Types for serializable props
interface SerializableUserWithPlan {
  id: string;
  clerkId: string;
  email: string;
  credits: number;
  plan: {
    id: string;
    name: string;
    features: string[];
    price: number;
    createdAt: string;
    updatedAt: string;
    credits: number;
    creditCap: number;
    type: string;
    period: string;
    isActive: boolean;
  } | null;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  creditCap: number;
  lastCreditReset: string;
  imageUrl?: string;
  stripeCustomerId?: string;
}

interface SerializablePrompt {
  id: string;
  name: string;
  content: string;
  metadata: any;
  promptType: string;
  description: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializableCreditHistory {
  id: string;
  createdAt: string;
  type: string;
  description: string;
  userId: string;
  amount: number;
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const dashboardService = DashboardService.getInstance();

  try {
    const [user, prompts, creditHistory, usageData] = await Promise.all([
      dashboardService.getUserData(clerkUser.id),
      dashboardService.getRecentPrompts(clerkUser.id),
      dashboardService.getCreditHistory(clerkUser.id),
      dashboardService.getUsageData(clerkUser.id),
    ]);

    // Only show the review button for admins
    const isAdmin = user.role === 'ADMIN';

    return (
      <>
        <DashboardClient
          user={{
            name: user.name || "User",
            email: user.email,
            imageUrl: (user as any).imageUrl || "",
            id: user.id,
            clerkId: user.clerkId,
            credits: user.credits,
            plan: user.plan,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            creditCap: user.creditCap,
            lastCreditReset: user.lastCreditReset,
            stripeCustomerId: (user as any).stripeCustomerId || "",
          }}
          prompts={prompts}
          creditHistory={creditHistory}
          usageData={usageData}
        />
        {isAdmin && (
          <AdminPromptReviewDialog />
        )}
      </>
    );
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    redirect("/sign-in?redirect_url=/dashboard");
  }
}
