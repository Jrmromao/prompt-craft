'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Target, Flame, Crown, Medal } from 'lucide-react';

interface CompetitiveDashboardProps {
  userRank: { rank: number; total: number };
  topCreators: Array<{
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    rank: number;
    badge?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    icon: string;
    earned: boolean;
    rarity: string;
  }>;
  activeChallenges: Array<{
    id: string;
    title: string;
    theme: string;
    endDate: Date;
    participants: number;
  }>;
}

export function CompetitiveDashboard({
  userRank,
  topCreators,
  achievements,
  activeChallenges
}: CompetitiveDashboardProps) {
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">#{userRank.rank}</div>
            <div className="text-sm text-muted-foreground">Your Rank</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{activeChallenges.length}</div>
            <div className="text-sm text-muted-foreground">Active Challenges</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">7</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Top Creators</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCreators.map((creator) => (
                <div key={creator.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold w-6">#{creator.rank}</div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback>{creator.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{creator.username}</div>
                      <div className="text-sm text-muted-foreground">{creator.score} upvotes</div>
                    </div>
                  </div>
                  {creator.badge && <span className="text-xl">{creator.badge}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Active Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{challenge.title}</h3>
                    <Badge variant="outline">{challenge.theme}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{challenge.participants} participants</span>
                    <span>Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                  <Button size="sm" className="w-full">Join Challenge</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Medal className="w-5 h-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border text-center ${
                  achievement.earned 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-muted/50 border-muted opacity-50'
                }`}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className="font-medium text-sm">{achievement.title}</div>
                <Badge 
                  variant={achievement.earned ? 'default' : 'secondary'}
                  className="mt-2 text-xs"
                >
                  {achievement.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
