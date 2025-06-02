import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface PromptUsage {
  creditsUsed: number;
  createdAt: Date;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return new NextResponse("User ID is required", { status: 400 });
  }

  // Verify the requesting user has access to this data
  if (targetUserId !== userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get the last 7 days of usage
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const prompts = await prisma.prompt.findMany({
    where: {
      userId: targetUserId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      creditsUsed: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group prompts by date and sum credits
  const usageByDate = prompts.reduce((acc: Record<string, number>, prompt: PromptUsage) => {
    const date = prompt.createdAt.toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + prompt.creditsUsed;
    return acc;
  }, {});

  // Fill in missing dates with 0
  const data = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    data.unshift({
      date: dateStr,
      credits: usageByDate[dateStr] || 0,
    });
  }

  return NextResponse.json(data);
} 