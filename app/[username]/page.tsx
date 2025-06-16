import { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { PublicProfile } from "@/components/profile/public-profile";
import { prisma } from "@/lib/prisma";
import { AuditService } from "@/lib/services/auditService";

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
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
}: PublicProfilePageProps) {
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

  // Fetch recent audit logs
  const recentActivity = await AuditService.getInstance().getAuditLogs(user.id, {
    limit: 5,
  });

  return (
    <PublicProfile 
      user={user}
      followerCount={user._count.followers}
      followingCount={user._count.following}
      recentActivity={recentActivity}
    />
  );
} 