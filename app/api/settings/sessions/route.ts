import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActiveSessions, revokeSession } from "@/app/services/settingsService";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const sessions = await getActiveSessions(userId);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Session fetch error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    
    if (!sessionId) {
      return new NextResponse("Session ID is required", { status: 400 });
    }

    const result = await revokeSession(userId, sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Session revocation error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 