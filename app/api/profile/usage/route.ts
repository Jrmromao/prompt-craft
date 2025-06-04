import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUsageStatsByClerkId } from "@/app/services/profileService";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const stats = await getUsageStatsByClerkId(userId);
  if (!stats) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.json(stats);
} 