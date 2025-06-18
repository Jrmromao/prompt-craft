import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/profile/public-profile";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/lib/services/auditService";

export async function generateMetadata({
  params,
}: { params: { username: string } }): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { username: true, displayName: true, bio: true },
  });
  
  if (!user) {
    return {
      title: "Profile Not Found",
    };
  }

  return {
    title: `@${user.username}`,
    description: user.bio || `${user.displayName || user.username}'s profile`,
  };
}

export default async function PublicProfilePage({
  params,
}: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Map Prisma user to the minimal shape expected by PublicProfile
  const mappedUser = {
    username: user.username,
    imageUrl: user.imageUrl ?? "",
    firstName: user.displayName ?? user.username,
  };

  // Fetch recent audit logs
  const recentActivity = await AuditService.getInstance().getAuditLogs(user.id, {
    limit: 5,
  });

  return (
    <PublicProfile 
      user={mappedUser}
      followerCount={user._count.followers}
      followingCount={user._count.following}
      recentActivity={recentActivity}
    />
  );
} 