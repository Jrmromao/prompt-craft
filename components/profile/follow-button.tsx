"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId,
          action: isFollowing ? "unfollow" : "follow",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing
          ? "You have unfollowed this user"
          : "You are now following this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading
        ? "Loading..."
        : isFollowing
        ? "Unfollow"
        : "Follow"}
    </Button>
  );
} 