'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Trophy, 
  Star, 
  BarChart3, 
  Eye, 
  User, 
  Crown, 
  Coins,
  Sparkles,
  ArrowRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Award,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Prompt {
  id: string;
  name: string;
  description: string;
  upvotes: number;
  views: number;
  tags: string[];
  user: {
    name: string;
    imageUrl: string;
  };
  createdAt: string;
  isPublic: boolean;
}

interface LeaderboardData {
  topCreators: Array<{
    id: string;
    name: string;
    imageUrl: string;
    totalUpvotes: number;
    promptCount: number;
  }>;
  topVoters: Array<{
    id: string;
    name: string;
    imageUrl: string;
    totalVotes: number;
  }>;
  topCreditEarners: Array<{
    id: string;
    name: string;
    imageUrl: string;
    creditsEarned: number;
  }>;
  trendingPrompts: Array<{
    id: string;
    name: string;
    totalUpvotes: number;
    weeklyUpvotes: number;
  }>;
  userStats: {
    creditsEarned: number;
    votesCast: number;
    promptsCreated: number;
    totalUpvotes: number;
  } | null;
}

type SidebarView = 'prompts' | 'leaderboards';
type LeaderboardTab = 'myStats' | 'topCreators' | 'topVoters' | 'topCreditEarners' | 'trending';
type ViewMode = 'grid' | 'list';

export function CommunityPromptsClient() {
  const { isSignedIn } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('most_popular');
  const [filterTag, setFilterTag] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Sidebar navigation state
  const [sidebarView, setSidebarView] = useState<SidebarView>('prompts');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<LeaderboardTab>(
    isSignedIn ? 'myStats' : 'topCreators'
  );
  
  // Leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    topCreators: [],
    topVoters: [],
    topCreditEarners: [],
    trendingPrompts: [],
    userStats: null
  });
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Fetch prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchQuery,
          sortBy,
          ...(filterTag !== 'all' && { tag: filterTag })
        });
        
        const response = await fetch(`/api/prompts/public?${params}`);
        if (response.ok) {
          const data = await response.json();
          setPrompts(data.prompts || []);
        }
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sidebarView === 'prompts') {
      fetchPrompts();
    }
  }, [searchQuery, sortBy, filterTag, sidebarView]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (sidebarView !== 'leaderboards') return;
      
      try {
        setLeaderboardLoading(true);
        const response = await fetch('/api/community/leaderboards');
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [sidebarView]);

  // Update default tab when auth state changes
  useEffect(() => {
    if (sidebarView === 'leaderboards') {
      setActiveLeaderboardTab(isSignedIn ? 'myStats' : 'topCreators');
    }
  }, [isSignedIn, sidebarView]);

  const sidebarItems = [
    {
      id: 'prompts' as SidebarView,
      label: 'Discover Prompts',
      icon: Sparkles,
      description: 'Explore community creations',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'leaderboards' as SidebarView,
      label: 'Leaderboards',
      icon: Trophy,
      description: 'Community champions',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const leaderboardTabs = [
    ...(isSignedIn ? [{
      id: 'myStats' as LeaderboardTab,
      label: 'My Stats',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    }] : []),
    {
      id: 'topCreators' as LeaderboardTab,
      label: 'Top Creators',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
    },
    {
      id: 'topVoters' as LeaderboardTab,
      label: 'Top Voters',
      icon: Star,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      id: 'topCreditEarners' as LeaderboardTab,
      label: 'Top Earners',
      icon: Coins,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      id: 'trending' as LeaderboardTab,
      label: 'Trending',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    }
  ];

  const filterTags = [
    { value: 'all', label: 'All Categories', icon: Grid3X3 },
    { value: 'writing', label: 'Writing', icon: MessageCircle },
    { value: 'coding', label: 'Coding', icon: BarChart3 },
    { value: 'marketing', label: 'Marketing', icon: Target },
    { value: 'creative', label: 'Creative', icon: Sparkles },
    { value: 'business', label: 'Business', icon: Award }
  ];

  const renderLeaderboardContent = () => {
    if (leaderboardLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboards...</p>
          </div>
        </div>
      );
    }

    const currentTab = leaderboardTabs.find(tab => tab.id === activeLeaderboardTab);
    
    if (!currentTab) {
      return <div>Tab not found</div>;
    }
    
    return (
      <div className="space-y-6">
        {/* Tab Header */}
        <div className={cn("rounded-2xl p-8 border-0", currentTab.bgColor)}>
          <div className="flex items-center gap-4">
            <div className={cn("p-4 rounded-xl bg-gradient-to-r shadow-lg", currentTab.color)}>
              <currentTab.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentTab.label}</h2>
              <p className="text-muted-foreground">
                {activeLeaderboardTab === 'myStats' && 'Your community achievements'}
                {activeLeaderboardTab === 'topCreators' && 'Most successful prompt creators'}
                {activeLeaderboardTab === 'topVoters' && 'Most active community members'}
                {activeLeaderboardTab === 'topCreditEarners' && 'Highest credit earners'}
                {activeLeaderboardTab === 'trending' && 'This week\'s rising stars'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {activeLeaderboardTab === 'myStats' && (
              leaderboardData.userStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Credits Earned', value: leaderboardData.userStats.creditsEarned, icon: Coins, color: 'from-green-500 to-emerald-500' },
                    { label: 'Votes Cast', value: leaderboardData.userStats.votesCast, icon: Star, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Prompts Created', value: leaderboardData.userStats.promptsCreated, icon: Sparkles, color: 'from-purple-500 to-pink-500' },
                    { label: 'Total Upvotes', value: leaderboardData.userStats.totalUpvotes, icon: TrendingUp, color: 'from-orange-500 to-red-500' }
                  ].map((stat, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <div className={cn("p-3 rounded-lg bg-gradient-to-r shadow-lg", stat.color)}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-muted-foreground mb-6">Create prompts and vote to see your stats here!</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Your First Prompt
                  </Button>
                </div>
              )
            )}

            {activeLeaderboardTab === 'topCreators' && (
              <div className="space-y-4">
                {leaderboardData.topCreators.length > 0 ? (
                  leaderboardData.topCreators.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg">
                        {index < 3 ? (
                          index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                        ) : (
                          index + 1
                        )}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700 shadow-md">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            {user.totalUpvotes}
                          </span> upvotes • <span className="font-medium">{user.promptCount}</span> prompts
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className={cn("p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r", currentTab.color)}>
                      <currentTab.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                    <p className="text-muted-foreground">Be the first to appear on this leaderboard!</p>
                  </div>
                )}
              </div>
            )}

            {activeLeaderboardTab === 'topVoters' && (
              <div className="space-y-4">
                {leaderboardData.topVoters.length > 0 ? (
                  leaderboardData.topVoters.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg">
                        {index < 3 ? (
                          index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                        ) : (
                          index + 1
                        )}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700 shadow-md">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {user.totalVotes}
                          </span> votes cast
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className={cn("p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r", currentTab.color)}>
                      <currentTab.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                    <p className="text-muted-foreground">Be the first to appear on this leaderboard!</p>
                  </div>
                )}
              </div>
            )}

            {activeLeaderboardTab === 'topCreditEarners' && (
              <div className="space-y-4">
                {leaderboardData.topCreditEarners.length > 0 ? (
                  leaderboardData.topCreditEarners.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg">
                        {index < 3 ? (
                          index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                        ) : (
                          index + 1
                        )}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700 shadow-md">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {user.creditsEarned}
                          </span> credits earned
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className={cn("p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-r", currentTab.color)}>
                      <currentTab.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                    <p className="text-muted-foreground">Be the first to appear on this leaderboard!</p>
                  </div>
                )}
              </div>
            )}

            {activeLeaderboardTab === 'trending' && (
              <div className="space-y-4">
                {leaderboardData.trendingPrompts.length > 0 ? (
                  leaderboardData.trendingPrompts.map((prompt, index) => (
                    <div key={prompt.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg line-clamp-1">{prompt.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              +{prompt.weeklyUpvotes}
                            </span> this week
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {prompt.totalUpvotes} total
                          </span>
                        </div>
                      </div>
                      <Link href={`/prompts/${prompt.id}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Trending Prompts</h3>
                    <p className="text-muted-foreground">Check back later for this week's trending content!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-400/5 dark:to-pink-400/5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium mb-6 shadow-lg">
              <Sparkles className="h-4 w-4" />
              Community Hub
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
              Discover Amazing Prompts
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore, upvote, and get inspired by the best AI prompts from our vibrant community of creators.
            </p>
            
            {/* Navigation Pills */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={sidebarView === item.id ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg",
                    sidebarView === item.id 
                      ? `bg-gradient-to-r ${item.gradient} text-white hover:shadow-xl border-0` 
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl border-2 border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => setSidebarView(item.id)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {sidebarView === 'prompts' ? (
          <div className="space-y-8">
            {/* Enhanced Search and Filters */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Search for the perfect prompt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-900"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-3">
                    {filterTags.map((tag) => (
                      <Button
                        key={tag.value}
                        variant={filterTag === tag.value ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "px-4 py-2 rounded-full font-medium transition-all duration-300",
                          filterTag === tag.value
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-0"
                            : "bg-white dark:bg-gray-800 hover:shadow-md border-2 border-gray-200 dark:border-gray-700"
                        )}
                        onClick={() => setFilterTag(tag.value)}
                      >
                        <tag.icon className="h-4 w-4 mr-2" />
                        {tag.label}
                      </Button>
                    ))}
                  </div>

                  {/* Sort and View Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="most_popular">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Most Popular
                            </div>
                          </SelectItem>
                          <SelectItem value="newest">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Newest
                            </div>
                          </SelectItem>
                          <SelectItem value="most_viewed">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Most Viewed
                            </div>
                          </SelectItem>
                          <SelectItem value="trending">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Trending
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          "p-2 rounded-lg",
                          viewMode === 'grid' 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "border-2 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "p-2 rounded-lg",
                          viewMode === 'list' 
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "border-2 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompts Display */}
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading amazing prompts...</p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "gap-6",
                viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
              )}>
                {prompts.map((prompt) => (
                  <Card key={prompt.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                          {prompt.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700">
                            <Eye className="h-3 w-3" />
                            {prompt.views}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3 text-base leading-relaxed">
                        {prompt.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700 shadow-md">
                            <AvatarImage src={prompt.user.imageUrl} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                              {prompt.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-muted-foreground">
                            {prompt.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                            <TrendingUp className="h-4 w-4" />
                            {prompt.upvotes}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {prompt.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={`${prompt.id}-tag-${index}`} variant="outline" className="text-xs border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400">
                            {tag}
                          </Badge>
                        ))}
                        {prompt.tags.length > 3 && (
                          <Badge key={`${prompt.id}-more-tags`} variant="outline" className="text-xs border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400">
                            +{prompt.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Link href={`/prompts/${prompt.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                            <Sparkles className="h-4 w-4 mr-2" />
                            View Prompt
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && prompts.length === 0 && (
              <div className="text-center py-20">
                <div className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">No prompts found</h3>
                <p className="text-muted-foreground text-lg mb-8">
                  Try adjusting your search or filters to discover amazing prompts
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterTag('all');
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Leaderboards Content
          <div className="space-y-8">
            {/* Leaderboard Navigation */}
            <div className="flex flex-wrap gap-3 justify-center">
              {leaderboardTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeLeaderboardTab === tab.id ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg",
                    activeLeaderboardTab === tab.id 
                      ? `bg-gradient-to-r ${tab.color} text-white hover:shadow-xl border-0` 
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl border-2 border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => setActiveLeaderboardTab(tab.id)}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {renderLeaderboardContent()}
          </div>
        )}
      </div>
    </div>
  );
} 