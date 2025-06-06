import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DeepseekCostService } from "@/lib/services/deepseekCostService";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const costService = DeepseekCostService.getInstance();
    const usage = await costService.getTotalUsage();

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching DeepSeek usage:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 