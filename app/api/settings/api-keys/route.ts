import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateApiKey, revokeApiKey } from "@/app/services/settingsService";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await generateApiKey(userId, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API key generation error:", error);
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
    const keyId = searchParams.get("keyId");
    
    if (!keyId) {
      return new NextResponse("Key ID is required", { status: 400 });
    }

    const result = await revokeApiKey(userId, keyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API key revocation error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 