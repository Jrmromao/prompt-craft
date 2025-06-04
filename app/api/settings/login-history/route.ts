import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

interface Session {
  id: string;
  deviceType?: string;
  browserName?: string;
  location?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's sessions
    const sessions = await clerkClient.users.getSessions(userId);

    // Format session data
    const loginHistory = sessions.map((session: Session) => ({
      id: session.id,
      device: session.deviceType || "Unknown",
      browser: session.browserName || "Unknown",
      location: session.location || "Unknown",
      ipAddress: session.ipAddress || "Unknown",
      lastActive: session.lastActiveAt,
      createdAt: session.createdAt,
    }));

    return NextResponse.json(loginHistory);
  } catch (error) {
    console.error("Error fetching login history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 