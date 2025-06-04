import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserSettings,
  updateEmailPreferences,
  updateNotificationSettings,
  updateLanguagePreferences,
  updateThemeSettings,
  updateSecuritySettings,
  generateApiKey,
  revokeApiKey,
  getActiveSessions,
  revokeSession,
} from "@/app/services/settingsService";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const settings = await getUserSettings(userId);
  if (!settings) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case "email":
        result = await updateEmailPreferences(userId, data);
        break;
      case "notifications":
        result = await updateNotificationSettings(userId, data);
        break;
      case "language":
        result = await updateLanguagePreferences(userId, data);
        break;
      case "theme":
        result = await updateThemeSettings(userId, data);
        break;
      case "security":
        result = await updateSecuritySettings(userId, data);
        break;
      default:
        return new NextResponse("Invalid settings type", { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings update error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 