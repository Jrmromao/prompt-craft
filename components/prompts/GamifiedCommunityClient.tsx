'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Target, 
  TrendingUp,
  Award,
  Gift,
  Sparkles,
  Lock,
  Flame,
  Heart,
  Share2,
  BookOpen,
  Users,
  Calendar,
  Clock,
  ArrowUp,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  ChevronRight,
  Coins,
  Shield,
  Diamond,
  Medal,
  Rocket,
  Eye,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  Download,
  Copy,
  ExternalLink,
  Gamepad2,
  Swords,
  Timer,
  CheckCircle,
  AlertCircle,
  Info,
  Gem,
  PlusCircle,
  Settings,
  BarChart3,
  Activity,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  Crown as CrownIcon,
  Star as StarIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon,
  Gift as GiftIcon,
  Sparkles as SparklesIcon,
  Lock as LockIcon,
  Flame as FlameIcon,
  Heart as HeartIcon,
  Share2 as Share2Icon,
  BookOpen as BookOpenIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  ArrowUp as ArrowUpIcon,
  Plus as PlusIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Grid as GridIcon,
  List as ListIcon,
  ChevronRight as ChevronRightIcon,
  Coins as CoinsIcon,
  Shield as ShieldIcon,
  Diamond as DiamondIcon,
  Medal as MedalIcon,
  Rocket as RocketIcon,
  Zap as LightningIcon,
  Eye as EyeIcon,
  MessageCircle as MessageCircleIcon,
  ThumbsUp as ThumbsUpIcon,
  Bookmark as BookmarkIcon,
  Download as DownloadIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  Gamepad2 as Gamepad2Icon,
  Swords as SwordsIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Gem as GemIcon,
  PlusCircle as PlusCircleIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlanType } from '@/utils/constants';

interface UserStats {
  level: number;
  experience: number;
  expToNext: number;
  totalExpRequired: number;
  reputation: number;
  streak: number;
  longestStreak: number;
  totalCreditsEarned: number;
  achievements: number;
  badges: number;
  rank: number | null;
  tier: string | null;
  planType: PlanType;
  premiumCredits: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rewards: {
    credits: number;
    experience: number;
    badges: string[];
  };
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  type: string;
  difficulty: string;
  progress: number;
  maxProgress: number;
  status: string;
  startDate: Date;
  endDate: Date;
  rewards: {
    credits: number;
    experience: number;
    badges: string[];
  };
  isPremium: boolean;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  copyCount: number;
  shareCount: number;
  qualityScore: number;
  difficultyLevel: number;
  isPremium: boolean;
  premiumTier: string | null;
  tags: { name: string; slug: string }[];
  user: {
    id: string;
    name: string;
    username: string;
    imageUrl: string;
    level: number;
    planType: PlanType;
  };
  createdAt: string;
  updatedAt: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  level: number;
  experience: number;
  reputation: number;
  streak: number;
  longestStreak: number;
  totalCreditsEarned: number;
  planType: PlanType;
}

const TIER_COLORS = {
  BRONZE: 'from-amber-600 to-amber-800',
  SILVER: 'from-gray-400 to-gray-600',
  GOLD: 'from-yellow-400 to-yellow-600',
  PLATINUM: 'from-blue-400 to-blue-600',
  DIAMOND: 'from-blue-400 to-blue-600',
  MASTER: 'from-blue-400 to-blue-500',
  GRANDMASTER: 'from-red-400 to-red-600',
  LEGENDARY: 'from-gradient-to-r from-blue-600 via-blue-500 to-blue-600',
};

const DIFFICULTY_COLORS = {
  1: 'bg-green-100 text-green-800 border-green-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  4: 'bg-orange-100 text-orange-800 border-orange-200',
  5: 'bg-red-100 text-red-800 border-red-200',
};

const PREMIUM_TIER_STYLES = {
  BASIC: 'border-blue-200 bg-blue-50/50',
  PREMIUM: 'border-blue-200 bg-blue-50/50',
  ELITE: 'border-blue-200 bg-blue-50/50',
  EXCLUSIVE: 'border-gradient-to-r from-blue-200 to-blue-200 bg-gradient-to-r from-blue-50/50 to-blue-50/50',
};

export default function GamifiedCommunityClient() {
  const { userId, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('most_popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [userId, searchTerm, selectedTag, sortBy]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load prompts
      const promptsResponse = await fetch(
        `/api/prompts/public?search=${searchTerm}&tag=${selectedTag}&sortBy=${sortBy}&limit=20`
      );
      const promptsData = await promptsResponse.json();
      setPrompts(promptsData.prompts || []);

      if (isSignedIn && userId) {
        // Load user stats
        const statsResponse = await fetch(`/api/gamification/stats/${userId}`);
        const statsData = await statsResponse.json();
        setUserStats(statsData);

        // Load achievements
        const achievementsResponse = await fetch(`/api/gamification/achievements/${userId}`);
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);

        // Load challenges
        const challengesResponse = await fetch(`/api/gamification/challenges/${userId}`);
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);

        // Load competitive data
        const competitiveResponse = await fetch('/api/competitive/leaderboard');
        const competitiveData = await competitiveResponse.json();
        setLeaderboard(competitiveData.topCreators || []);
        
        // Check for new achievements
        if (competitiveData.newAchievements?.length > 0) {
          // Show achievement notification
          showAchievementNotification(competitiveData.newAchievements);
        }
      } else {
        // Load public leaderboard
        const leaderboardResponse = await fetch('/api/community/leaderboards');
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.topCreators || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showAchievementNotification = (newAchievements: Achievement[]) => {
    // Show toast notification for new achievements
    newAchievements.forEach(achievement => {
      console.log(`🎉 Achievement unlocked: ${achievement.name}!`);
    });
  };

  const handleVote = async (promptId: string, value: number) => {
    if (!isSignedIn) {
      // Show sign-in prompt
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update prompts state
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, upvotes: result.upvotes, downvotes: result.downvotes }
            : p
        ));

        // Show reward notification if any
        if (result.creditsEarned > 0) {
          // Show notification
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePremiumAction = (action: string) => {
    if (!userStats || userStats.planType === PlanType.FREE) {
      setShowPremiumUpgrade(true);
      return;
    }
    // Handle premium action
  };

  const renderUserDashboard = () => {
    if (!userStats) return null;

    const expProgress = ((userStats.experience / userStats.totalExpRequired) * 100);
    const tierGradient = TIER_COLORS[userStats.tier as keyof typeof TIER_COLORS] || 'from-gray-400 to-gray-600';

    return (
      <div className="space-y-6">
        {/* User Profile Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/10 to-blue-500/10" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                    <AvatarImage src={userStats.planType === PlanType.PRO ? '/premium-avatar.png' : '/default-avatar.png'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-500 text-white font-bold">
                      {userStats.level}
                    </AvatarFallback>
                  </Avatar>
                  {userStats.planType === PlanType.PRO && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Level {userStats.level}</h3>
                  <p className="text-sm text-gray-600">
                    {userStats.experience.toLocaleString()} / {userStats.totalExpRequired.toLocaleString()} XP
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {userStats.streak} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-2xl font-bold text-blue-600">
                  <Coins className="h-6 w-6" />
                  <span>{userStats.totalCreditsEarned.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600">Total Credits Earned</p>
              </div>
            </div>
            <Progress value={expProgress} className="mt-4 h-3" />
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{userStats.achievements}</p>
            <p className="text-sm text-blue-700">Achievements</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{userStats.badges}</p>
            <p className="text-sm text-blue-700">Badges</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{userStats.reputation}</p>
            <p className="text-sm text-green-700">Reputation</p>
          </Card>
          <Card className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{userStats.longestStreak}</p>
            <p className="text-sm text-orange-700">Best Streak</p>
          </Card>
        </div>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Swords className="h-5 w-5 text-red-600" />
              <span>Active Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      challenge.isPremium ? "bg-gradient-to-r from-blue-500 to-blue-500" : "bg-blue-500"
                    )}>
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{challenge.name}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="w-20 mb-1" />
                    <p className="text-xs text-gray-500">{challenge.progress}/{challenge.maxProgress}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPromptCard = (prompt: Prompt) => {
    const difficultyClass = DIFFICULTY_COLORS[prompt.difficultyLevel as keyof typeof DIFFICULTY_COLORS];
    const premiumClass = prompt.isPremium ? PREMIUM_TIER_STYLES[prompt.premiumTier as keyof typeof PREMIUM_TIER_STYLES] : '';

    return (
      <Card key={prompt.id} className={cn(
        "group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
        premiumClass
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className={difficultyClass}>
                  Level {prompt.difficultyLevel}
                </Badge>
                {prompt.isPremium && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span>{prompt.qualityScore.toFixed(1)}</span>
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {prompt.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {prompt.description}
              </CardDescription>
            </div>
            {prompt.isPremium && (
              <Lock className="h-5 w-5 text-blue-500 opacity-60" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{prompt.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Copy className="h-4 w-4" />
                <span>{prompt.copyCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="h-4 w-4" />
                <span>{prompt.shareCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={prompt.user.imageUrl} />
                <AvatarFallback className="text-xs">
                  {prompt.user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{prompt.user.name}</span>
              {prompt.user.planType === PlanType.PRO && (
                <Crown className="h-3 w-3 text-yellow-500" />
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.slug} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(prompt.id, 1)}
                className="hover:bg-green-50 hover:text-green-600"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {prompt.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(prompt.id, -1)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <ThumbsUp className="h-4 w-4 mr-1 rotate-180" />
                {prompt.downvotes}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => prompt.isPremium ? handlePremiumAction('bookmark') : null}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => prompt.isPremium ? handlePremiumAction('copy') : null}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm">
                View
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLeaderboard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span>Community Champions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                  index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                  index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                  index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-800" :
                  "bg-gray-400"
                )}>
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">Level {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{(user.totalCreditsEarned || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">credits</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Community Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Prompts
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Explore, upvote, and get inspired by the best AI prompts from our
              vibrant community of creators.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                onClick={() => setActiveTab('discover')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Discover Prompts
              </Button>
              {isSignedIn && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  My Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="discover" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboards</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Social</span>
            </TabsTrigger>
            {isSignedIn && (
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for the perfect prompt..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most_popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="highest_rated">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompts Grid */}
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {prompts.map(renderPromptCard)}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-red-600" />
                    <span>Weekly Challenges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{challenge.name}</h3>
                          <Badge variant={challenge.isPremium ? "default" : "outline"}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center justify-between mb-3">
                          <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="flex-1 mr-4" />
                          <span className="text-sm text-gray-500">
                            {challenge.progress}/{challenge.maxProgress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Timer className="h-4 w-4" />
                            <span>Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                          </div>
                          <Button size="sm" disabled={challenge.status === 'completed'}>
                            {challenge.status === 'completed' ? 'Completed' : 'Join'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Challenge Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Medal className="h-5 w-5 text-yellow-600" />
                    <span>Challenge Champions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                            index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-800" :
                            "bg-gray-400"
                          )}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">Level {user.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{user.totalCreditsEarned?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Following Feed */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Following Feed</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSignedIn ? (
                      <div className="space-y-4">
                        <p className="text-gray-600 text-center py-8">
                          Follow creators to see their latest prompts here!
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Sign in to follow creators and see their updates</p>
                        <Button>Sign In</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Suggested Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Suggested Creators</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">Level {user.level}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Creators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span>Top Creators</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                            index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-800" :
                            "bg-gray-400"
                          )}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">Level {user.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{(user.totalCreditsEarned || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">credits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Voters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ThumbsUp className="h-5 w-5 text-blue-600" />
                    <span>Top Voters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((user, index) => (
                      <div key={`voter-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                            index === 0 ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                            index === 1 ? "bg-gradient-to-r from-green-400 to-green-600" :
                            index === 2 ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                            "bg-gray-400"
                          )}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">Community Helper</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{Math.floor(Math.random() * 500) + 100}</p>
                          <p className="text-xs text-gray-500">votes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isSignedIn && (
            <TabsContent value="dashboard" className="space-y-6">
              {renderUserDashboard()}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Premium Upgrade Modal */}
      {showPremiumUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Upgrade to Premium</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Unlock premium features including advanced collections, priority support, and exclusive content.
              </p>
              <div className="flex space-x-2">
                <Button onClick={() => setShowPremiumUpgrade(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-500">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 