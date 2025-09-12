import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfile } from "@/components/profile/public-profile";
import { UserService } from "@/lib/services/UserService";
import { AuditService } from "@/lib/services/auditService";

export async function generateMetadata(props: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const params = await props.params;
  const userService = UserService.getInstance();
  const user = await userService.getUserByUsername(params.username);
  
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

export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const userService = UserService.getInstance();
  const user = await userService.getUserByUsername(params.username);

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
      followerCount={0} // Default value since _count is not available
      followingCount={0} // Default value since _count is not available
      recentActivity={recentActivity}
    />
  );
} 