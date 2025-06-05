import { NextResponse } from "next/server";

// Try to import Clerk, but allow fallback if not available
let auth: any = null;
let clerkClient: any = null;
try {
  // Dynamically import Clerk modules if available
  // @ts-ignore
  ({ auth, clerkClient } = require("@clerk/nextjs/server"));
} catch (e) {
  // Clerk not available, will use mock data
}

interface Session {
  id: string;
  deviceType?: string;
  browserName?: string;
  location?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
}

const mockLoginHistory: Session[] = [
  {
    id: "mock-session-1",
    deviceType: "Desktop",
    browserName: "Chrome",
    location: "Lisbon, Portugal",
    ipAddress: "192.168.1.1",
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "mock-session-2",
    deviceType: "Mobile",
    browserName: "Safari",
    location: "Porto, Portugal",
    ipAddress: "192.168.1.2",
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function GET(request: Request) {
  // If Clerk is available, try to use it
  if (auth && clerkClient) {
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
      // If Clerk fails, fallback to mock data in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(mockLoginHistory);
      }
      console.error("Error fetching login history:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  // If Clerk is not available, fallback to mock data in development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(mockLoginHistory);
  }
  return new NextResponse("Clerk not configured", { status: 501 });
} 