'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, TrendingUp, Users, Award } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VoteStats {
  upvotes: number
  downvotes: number
  totalVotes: number
  userVote: number | null
  recentVoters: Array<{
    id: string
    name: string
    imageUrl?: string
    vote: number
  }>
  trending: boolean
}

interface EnhancedVotingProps {
  promptId: string
  initialStats: VoteStats
  onStatsChange?: (stats: VoteStats) => void
  showAnalytics?: boolean
}

export function EnhancedVoting({ 
  promptId, 
  initialStats, 
  onStatsChange,
  showAnalytics = true 
}: EnhancedVotingProps) {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<VoteStats>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const [showVoters, setShowVoters] = useState(false)

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error('Please sign in to vote')
      return
    }

    if (isLoading) return

    const previousStats = stats
    
    // Optimistic update
    let newStats = { ...stats }
    
    if (stats.userVote === value) {
      // Remove vote
      if (value === 1) {
        newStats.upvotes -= 1
      } else {
        newStats.downvotes -= 1
      }
      newStats.userVote = null
      newStats.totalVotes -= 1
    } else if (stats.userVote) {
      // Change vote
      if (stats.userVote === 1) {
        newStats.upvotes -= 1
        newStats.downvotes += 1
      } else {
        newStats.downvotes -= 1
        newStats.upvotes += 1
      }
      newStats.userVote = value
    } else {
      // New vote
      if (value === 1) {
        newStats.upvotes += 1
      } else {
        newStats.downvotes += 1
      }
      newStats.userVote = value
      newStats.totalVotes += 1
    }

    setStats(newStats)
    onStatsChange?.(newStats)

    setIsLoading(true)
    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const data = await response.json()
      
      // Update with server response
      const serverStats = {
        ...newStats,
        upvotes: data.upvotes || newStats.upvotes,
        totalVotes: (data.upvotes || 0) + (data.downvotes || 0)
      }
      
      setStats(serverStats)
      onStatsChange?.(serverStats)

      if (data.creditsAwarded > 0) {
        toast.success(`Awarded ${data.creditsAwarded} credits to author!`)
      }
    } catch (error) {
      // Revert optimistic update
      setStats(previousStats)
      onStatsChange?.(previousStats)
      toast.error('Failed to vote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const voteRatio = stats.totalVotes > 0 ? (stats.upvotes / stats.totalVotes) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Main voting buttons */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={stats.userVote === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(1)}
                disabled={isLoading}
                className={cn(
                  "transition-all duration-200",
                  stats.userVote === 1 && "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {stats.upvotes}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upvote this prompt</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={stats.userVote === -1 ? "default" : "outline"}
                size="sm"
                onClick={() => handleVote(-1)}
                disabled={isLoading}
                className={cn(
                  "transition-all duration-200",
                  stats.userVote === -1 && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {stats.downvotes}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Downvote this prompt</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Analytics badges */}
        {showAnalytics && (
          <div className="flex items-center gap-2">
            {stats.trending && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            
            {voteRatio >= 80 && stats.totalVotes >= 10 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Award className="h-3 w-3 mr-1" />
                Highly Rated
              </Badge>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  <Users className="h-3 w-3 mr-1" />
                  {stats.totalVotes}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{voteRatio.toFixed(1)}% positive rating</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Vote ratio bar */}
      {showAnalytics && stats.totalVotes > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{voteRatio.toFixed(1)}% positive</span>
            <span>{stats.totalVotes} total votes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${voteRatio}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent voters */}
      {showAnalytics && stats.recentVoters.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoters(!showVoters)}
            className="text-xs text-muted-foreground p-0 h-auto"
          >
            Recent voters ({stats.recentVoters.length})
          </Button>
          
          {showVoters && (
            <div className="flex flex-wrap gap-1">
              {stats.recentVoters.slice(0, 10).map((voter) => (
                <Tooltip key={voter.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs">
                      <span>{voter.name}</span>
                      {voter.vote === 1 ? (
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{voter.name} {voter.vote === 1 ? 'upvoted' : 'downvoted'}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
