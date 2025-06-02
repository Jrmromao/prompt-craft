import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { validateAuthentication } from "@/lib/actions/authValidation.action";
import { redirect } from "next/navigation";
import { DashboardService } from "@/lib/services/dashboardService";

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
  const auth = await validateAuthentication();
  if (!auth.success) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const dashboardService = DashboardService.getInstance();

  try {
    const [user, prompts, creditHistory, usageData] = await Promise.all([
      dashboardService.getUserData(auth.user.id),
      dashboardService.getRecentPrompts(auth.user.id),
      dashboardService.getCreditHistory(auth.user.id),
      dashboardService.getUsageData(auth.user.id),
    ]);

    return (
      <DashboardClient
        user={user}
        prompts={prompts}
        creditHistory={creditHistory}
        usageData={usageData}
      />
    );
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    redirect("/sign-in?redirect_url=/dashboard");
  }
}
