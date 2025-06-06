import { NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  generateApiKey,
  rotateApiKey,
  listApiKeys,
  deleteApiKey,
} from "@/utils/api-keys";

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().min(3).max(50),
  expiresIn: z.number().min(1).max(365).optional(), // Days until expiration
  scopes: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = createApiKeySchema.parse(body);

    // Calculate expiration date if provided
    const expiresAt = data.expiresIn
      ? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000)
      : undefined;

    const apiKey = await generateApiKey(userId, {
      name: data.name,
      expiresAt,
      scopes: data.scopes,
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: "Validation Error",
        details: error.errors,
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error creating API key:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiKeys = await listApiKeys(userId);
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error listing API keys:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return new NextResponse("Missing key ID", { status: 400 });
    }

    await deleteApiKey(userId, keyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 