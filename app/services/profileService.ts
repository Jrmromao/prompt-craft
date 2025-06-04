import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Fetches a user profile by Clerk ID.
 * @param clerkId Clerk user ID
 * @returns User object or null if not found
 */
export async function getProfileByClerkId(clerkId: string): Promise<User | null> {
  if (!clerkId) throw new Error("Clerk ID is required");
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });
  return user;
}

export type { User }; 