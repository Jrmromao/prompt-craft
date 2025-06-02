import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      plan: true,
      prompts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      creditHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    redirect("/onboarding");
  }

  return (
    <DashboardClient
      user={user}
      prompts={user.prompts}
      creditHistory={user.creditHistory}
    />
  );
}