"use client";

import { User } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, BookOpenIcon, StarIcon, Sparkles, Menu, X, Heart, MessageCircle, Share2, Users, Zap } from "lucide-react";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { TemplateService } from "@/lib/services/templateService";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Template {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  content: string;
  type: 'zero-shot' | 'few-shot' | 'chain-of-thought';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  example: string;
  bestPractices: string[];
  successMetrics: {
    clarity: number;
    specificity: number;
    effectiveness: number;
  };
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  user?: {
    name: string | null;
    email: string | null;
  };
}

interface PublicProfileProps {
  user: User;
  followerCount: number;
  followingCount: number;
  recentActivity: any[];
}

export function PublicProfile({ user, followerCount, followingCount, recentActivity }: PublicProfileProps) {
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const templateService = new TemplateService();
    
    const fetchTemplates = async () => {
      try {
        const [publicTemps, popularTemps] = await Promise.all([
          templateService.getTemplates({ search: user.username || '', isPublic: true }),
          templateService.getPopularTemplates()
        ]);
        
        setPublicTemplates(publicTemps);
        setPopularTemplates(popularTemps);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, [user.username]);

  const formatDate = (dateString: string | Date) => {
    try {
      // Handle both string and Date objects
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      
      // Check if the date is valid
      if (!isValid(date)) {
        console.warn('Invalid date:', dateString);
        return 'Recently';
      }

      // Format the date
      const formatted = formatDistanceToNow(date, { addSuffix: true });
      
      // If the date is in the future or too old, return a fallback
      if (formatted.includes('in') || formatted.includes('over')) {
        return 'Recently';
      }

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Profile Header */}
      <div className="relative border-b border-border/40 bg-gradient-to-b from-purple-500/5 to-pink-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-12">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-sm" />
              <Avatar className="relative h-28 w-28 ring-4 ring-background">
                <AvatarImage src={user.imageUrl || ''} alt={user.username || ''} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-lg">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {user.firstName || user.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-semibold text-foreground">{followerCount}</span>
                <span className="text-sm text-muted-foreground">Followers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-pink-500" />
                <span className="text-lg font-semibold text-foreground">{followingCount}</span>
                <span className="text-sm text-muted-foreground">Following</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-purple-500/25 hover:scale-105">
                <Users className="mr-2 h-4 w-4" />
                Follow
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-background/50 px-6 py-2.5 text-sm font-medium text-purple-500 backdrop-blur-sm transition-all hover:bg-purple-500/10">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Public Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Public Templates
              </h2>
              <span className="rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-500">
                {publicTemplates.length} templates
              </span>
            </div>
            <div className="grid gap-4">
              {publicTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/prompts/${template.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground group-hover:text-purple-500">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Heart className="mr-1.5 h-4 w-4 text-pink-500" />
                        {template.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Zap className="mr-1.5 h-4 w-4 text-purple-500" />
                        {template.usageCount}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {template.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Popular Templates
              </h2>
              <span className="rounded-full bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-500">
                Trending
              </span>
            </div>
            <div className="grid gap-4">
              {popularTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/prompts/${template.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground group-hover:text-pink-500">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Heart className="mr-1.5 h-4 w-4 text-pink-500" />
                        {template.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Zap className="mr-1.5 h-4 w-4 text-purple-500" />
                        {template.usageCount}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {template.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 