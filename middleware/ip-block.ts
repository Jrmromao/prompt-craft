import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Constants for IP blocking
const BLOCK_DURATION = 24 * 60 * 60; // 24 hours in seconds
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_SIZE = 60 * 60; // 1 hour in seconds

export async function ipBlockMiddleware(req: NextRequest) {
  // Get IP from headers or use unknown
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  
  // Skip blocking for localhost during development
  if (process.env.NODE_ENV === "development" && (ip === "127.0.0.1" || ip === "::1")) {
    return null;
  }

  // Check if IP is blocked
  const isBlocked = await redis.get(`blocked:${ip}`);
  if (isBlocked) {
    return new NextResponse("IP address blocked due to suspicious activity", { status: 403 });
  }

  // Get failed attempts for this IP
  const failedAttempts = await redis.get(`failed_attempts:${ip}`) || 0;

  // If too many failed attempts, block the IP
  if (Number(failedAttempts) >= MAX_FAILED_ATTEMPTS) {
    await redis.set(`blocked:${ip}`, true, { ex: BLOCK_DURATION });
    await redis.del(`failed_attempts:${ip}`);
    
    // Log the blocking event
    await prisma.auditLog.create({
      data: {
        action: "SECURITY_EVENT",
        resource: "IP_BLOCK",
        details: {
          ip,
          reason: "Too many failed attempts",
          failedAttempts: Number(failedAttempts),
        },
        status: "SUCCESS",
        timestamp: new Date(),
      },
    });

    return new NextResponse("IP address blocked due to suspicious activity", { status: 403 });
  }

  return null;
}

export async function recordFailedAttempt(ip: string) {
  const key = `failed_attempts:${ip}`;
  
  // Increment failed attempts
  await redis.incr(key);
  
  // Set expiration if not already set
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expire(key, WINDOW_SIZE);
  }
}

export async function resetFailedAttempts(ip: string) {
  await redis.del(`failed_attempts:${ip}`);
} 