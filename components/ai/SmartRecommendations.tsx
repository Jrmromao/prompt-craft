'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface RecommendedPrompt {
  id: string
  name: string
  description: string
  slug: string
  upvotes: number
  tags: string[]
  similarity: number
  reason: 'similar_content' | 'popular_with_users' | 'trending' | 'author_other_work'
  author: {
    name: string
    imageUrl?: string
  }
}

interface SmartRecommendationsProps {
  promptId: string
  userId?: string
  tags?: string[]
  className?: string
}

export function SmartRecommendations({ 
  promptId, 
  userId, 
  tags = [],
  className 
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [promptId, userId])

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/prompts/${promptId}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tags })
      })

      if (!response.ok) throw new Error('Failed to fetch recommendations')

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const getReasonIcon = (reason: RecommendedPrompt['reason']) => {
    switch (reason) {
      case 'similar_content':
        return <Sparkles className="h-4 w-4" />
      case 'popular_with_users':
        return <Users className="h-4 w-4" />
      case 'trending':
        return <TrendingUp className="h-4 w-4" />
      case 'author_other_work':
        return <Clock className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getReasonText = (reason: RecommendedPrompt['reason']) => {
    switch (reason) {
      case 'similar_content':
        return 'Similar content'
      case 'popular_with_users':
        return 'Popular with users like you'
      case 'trending':
        return 'Trending now'
      case 'author_other_work':
        return 'From same author'
      default:
        return 'Recommended'
    }
  }

  const getReasonColor = (reason: RecommendedPrompt['reason']) => {
    switch (reason) {
      case 'similar_content':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'popular_with_users':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'trending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'author_other_work':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{error || 'No recommendations available at the moment'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Recommendations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Prompts you might find interesting
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((prompt) => (
          <div
            key={prompt.id}
            className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {prompt.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {prompt.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <span>{prompt.upvotes}</span>
                  <TrendingUp className="h-3 w-3" />
                </div>
              </div>

              {/* Reason and similarity */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getReasonColor(prompt.reason))}
                >
                  {getReasonIcon(prompt.reason)}
                  <span className="ml-1">{getReasonText(prompt.reason)}</span>
                </Badge>
                
                <div className="text-xs text-muted-foreground">
                  {Math.round(prompt.similarity * 100)}% match
                </div>
              </div>

              {/* Tags */}
              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prompt.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>by {prompt.author.name}</span>
                </div>
                
                <Link href={`/community-prompts/${prompt.slug}`}>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* View more */}
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Explore More Prompts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
