import { NextRequest, NextResponse } from "next/server";
import { QuotaService } from "@/services/quota-service";

export async function quotaMiddleware(req: NextRequest) {
  const quotaService = QuotaService.getInstance();
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return null; // Skip quota check if no user ID
  }

  // Determine quota type based on the request path
  let quotaType: "API_CALLS" | "PROMPT_GENERATIONS" | "STORAGE";
  if (req.nextUrl.pathname.startsWith("/api/prompts/generate")) {
    quotaType = "PROMPT_GENERATIONS";
  } else if (req.nextUrl.pathname.startsWith("/api/storage")) {
    quotaType = "STORAGE";
  } else {
    quotaType = "API_CALLS";
  }

  // Check quota
  const quotaResult = await quotaService.checkQuota(userId, quotaType);

  if (!quotaResult.isAllowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Quota exceeded",
        message: `You have exceeded your ${quotaType.toLowerCase()} quota. Please upgrade your plan or try again later.`,
        remaining: quotaResult.remaining,
        limit: quotaResult.limit,
        resetAt: quotaResult.resetAt,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": quotaResult.limit.toString(),
          "X-RateLimit-Remaining": quotaResult.remaining.toString(),
          "X-RateLimit-Reset": quotaResult.resetAt?.toISOString() || "",
        },
      }
    );
  }

  // Add quota headers to response
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", quotaResult.limit.toString());
  response.headers.set("X-RateLimit-Remaining", quotaResult.remaining.toString());
  response.headers.set("X-RateLimit-Reset", quotaResult.resetAt?.toISOString() || "");

  return response;
} 