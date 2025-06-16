import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (action === "follow") {
      await prisma.follow.create({
        data: {
          followerId: authUser.id,
          followingId: targetUserId,
        },
      });
    } else if (action === "unfollow") {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: authUser.id,
            followingId: targetUserId,
          },
        },
      });
    } else {
      return new NextResponse("Invalid action", { status: 400 });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 