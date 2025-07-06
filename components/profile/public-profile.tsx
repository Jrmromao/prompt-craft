"use client";

import { User } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, BookOpenIcon, StarIcon, Sparkles, Menu, X, Heart, MessageCircle, Share2, Users, Zap, Copy, Twitter, Linkedin, Globe, CheckCircle } from "lucide-react";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { TemplateService } from "@/lib/services/templateService";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Template {
  id: string;
  slug: string;
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
  user: {
    username: string;
    imageUrl?: string;
    firstName?: string;
    bio?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
    isVerified?: boolean;
  };
  followerCount: number;
  followingCount: number;
  recentActivity: any[];
}

export function PublicProfile({ user, followerCount, followingCount, recentActivity }: PublicProfileProps) {
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [copied, setCopied] = useState(false);

  // Placeholder social links and bio (replace with real data if available)
  const bio = user.bio || "AI enthusiast. Building with PromptHive.";
  const website = user.website || "";
  const twitter = user.twitter || "";
  const linkedin = user.linkedin || "";
  const isVerified = user.isVerified || false;

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

  // Calculate total upvotes
  const totalUpvotes = publicTemplates.reduce((sum, t) => sum + t.rating, 0);

  // Share profile handler
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <div className="relative border-b border-border/40 bg-gradient-to-b from-purple-500/5 to-pink-500/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-gradient-x" />
        <div className="container relative mx-auto px-4 py-16 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-lg animate-pulse" />
            <Avatar className="relative h-32 w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={user.imageUrl || ''} alt={user.username || ''} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-2xl">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isVerified && (
              <span className="absolute bottom-2 right-2 rounded-full bg-white p-1.5 shadow-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </span>
            )}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
            {user.firstName || user.username}
            {isVerified && <CheckCircle className="h-6 w-6 text-green-500" />}
          </h1>
          <p className="text-base text-muted-foreground mb-2">@{user.username}</p>
          {bio && <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-2">{bio}</p>}
          <div className="flex items-center justify-center gap-3 mb-4">
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 flex items-center gap-1"><Globe className="h-4 w-4" />Website</a>
            )}
            {twitter && (
              <a href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400 flex items-center gap-1"><Twitter className="h-4 w-4" />Twitter</a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-700 flex items-center gap-1"><Linkedin className="h-4 w-4" />LinkedIn</a>
            )}
          </div>
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 bg-white/60 dark:bg-black/30 rounded-xl shadow-lg px-8 py-4 mb-6 mt-2 backdrop-blur-md">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-purple-600">{followerCount}</span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-pink-600">{followingCount}</span>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-purple-600">{publicTemplates.length}</span>
              <span className="text-xs text-muted-foreground">Templates</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-yellow-500">{totalUpvotes}</span>
              <span className="text-xs text-muted-foreground">Upvotes</span>
            </div>
          </div>
          {/* Modern Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
            <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-purple-500/25 hover:scale-105">
              <Users className="mr-2 h-5 w-5" />Follow
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-purple-500/20 bg-background/50 px-8 py-3 text-base font-semibold text-purple-500 backdrop-blur-sm transition-all hover:bg-purple-500/10">
              <MessageCircle className="mr-2 h-5 w-5" />Message
            </button>
            <button onClick={handleCopy} className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/80 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 transition-all">
              <Copy className="mr-2 h-5 w-5" />{copied ? 'Copied!' : 'Share Profile'}
            </button>
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
                  href={`/community-prompts/${template.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white/80 dark:bg-card/50 p-6 backdrop-blur-md transition-all hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-purple-500">
                        {template.name}
                        {template.type && (
                          <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", template.type === 'few-shot' ? 'bg-pink-100 text-pink-600' : template.type === 'chain-of-thought' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-600')}>{template.type}</span>
                        )}
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
                  <button className="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">View</button>
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
                  className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white/80 dark:bg-card/50 p-6 backdrop-blur-md transition-all hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-pink-500">
                        {template.name}
                        {template.type && (
                          <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", template.type === 'few-shot' ? 'bg-pink-100 text-pink-600' : template.type === 'chain-of-thought' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-600')}>{template.type}</span>
                        )}
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
                  <button className="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all">View</button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Recent Activity Timeline */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Recent Activity</h3>
          <ul className="relative border-l-2 border-purple-200 dark:border-purple-800 pl-6 space-y-6">
            {recentActivity.map((activity, idx) => (
              <li key={idx} className="relative">
                <span className="absolute -left-3 top-1.5 flex h-3 w-3 items-center justify-center">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"></span>
                </span>
                <div className="bg-white/80 dark:bg-card/50 rounded-lg shadow p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{activity.action || 'Activity'}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.description || ''}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 