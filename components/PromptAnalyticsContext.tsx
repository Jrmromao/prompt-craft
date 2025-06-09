'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { clientAnalyticsService } from '@/lib/services/clientAnalyticsService';
import { useToast } from '@/components/ui/use-toast';

interface PromptAnalyticsContextValue {
  copyCount: number;
  setCopyCount: (count: number) => void;
  incrementCopyCount: () => Promise<void>;
  viewCount: number;
  setViewCount: (count: number) => void;
  incrementViewCount: () => Promise<void>;
  usageCount: number;
  setUsageCount: (count: number) => void;
  incrementUsageCount: (result?: any) => Promise<void>;
  commentCount: number;
  setCommentCount: (count: number) => void;
  incrementCommentCount: () => void;
  isLoading: {
    view: boolean;
    usage: boolean;
    copy: boolean;
  };
  upvoteCount: number;
  incrementUpvoteCount: (hasUpvoted: boolean) => void;
}

const PromptAnalyticsContext = createContext<PromptAnalyticsContextValue | undefined>(undefined);

export function usePromptAnalytics() {
  const context = useContext(PromptAnalyticsContext);
  if (!context) {
    throw new Error('usePromptAnalytics must be used within a PromptAnalyticsProvider');
  }
  return context;
}

interface PromptAnalyticsProviderProps {
  promptId: string;
  initialCopyCount: number;
  initialViewCount: number;
  initialUsageCount: number;
  initialCommentCount: number;
  children: ReactNode;
}

export function PromptAnalyticsProvider({
  promptId,
  initialCopyCount,
  initialViewCount,
  initialUsageCount,
  initialCommentCount,
  children,
}: PromptAnalyticsProviderProps) {
  const [copyCount, setCopyCount] = useState(initialCopyCount);
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [usageCount, setUsageCount] = useState(initialUsageCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [isLoading, setIsLoading] = useState({
    view: false,
    usage: false,
    copy: false,
  });
  const [upvoteCount, setUpvoteCount] = useState(0);
  const { toast } = useToast();

  const incrementViewCount = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, view: true }));
      // Optimistic update
      setViewCount(prev => prev + 1);
      
      await clientAnalyticsService.trackPromptView(promptId);
    } catch (error) {
      // Revert on error
      setViewCount(prev => prev - 1);
      toast({
        title: 'Error',
        description: 'Failed to track view',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, view: false }));
    }
  }, [promptId, toast]);

  const incrementUsageCount = useCallback(async (result?: any) => {
    try {
      setIsLoading(prev => ({ ...prev, usage: true }));
      // Optimistic update
      setUsageCount(prev => prev + 1);
      
      await clientAnalyticsService.trackPromptUsage(promptId, result);
    } catch (error) {
      // Revert on error
      setUsageCount(prev => prev - 1);
      toast({
        title: 'Error',
        description: 'Failed to track usage',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, usage: false }));
    }
  }, [promptId, toast]);

  const incrementCopyCount = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, copy: true }));
      // Optimistic update
      setCopyCount(prev => prev + 1);
      
      await clientAnalyticsService.trackPromptCopy(promptId);
    } catch (error) {
      // Revert on error
      setCopyCount(prev => prev - 1);
      toast({
        title: 'Error',
        description: 'Failed to track copy',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, copy: false }));
    }
  }, [promptId, toast]);

  const incrementCommentCount = useCallback(() => {
    setCommentCount(prev => prev + 1);
  }, []);

  const incrementUpvoteCount = useCallback((hasUpvoted: boolean) => {
    setUpvoteCount(prev => hasUpvoted ? prev + 1 : prev - 1);
  }, []);

  // Update initial values when they change
  useEffect(() => {
    setCopyCount(initialCopyCount);
  }, [initialCopyCount]);

  useEffect(() => {
    setViewCount(initialViewCount);
  }, [initialViewCount]);

  useEffect(() => {
    setUsageCount(initialUsageCount);
  }, [initialUsageCount]);

  useEffect(() => {
    setCommentCount(initialCommentCount);
  }, [initialCommentCount]);

  return (
    <PromptAnalyticsContext.Provider
      value={{
        copyCount,
        setCopyCount,
        incrementCopyCount,
        viewCount,
        setViewCount,
        incrementViewCount,
        usageCount,
        setUsageCount,
        incrementUsageCount,
        commentCount,
        setCommentCount,
        incrementCommentCount,
        isLoading,
        upvoteCount,
        incrementUpvoteCount,
      }}
    >
      {children}
    </PromptAnalyticsContext.Provider>
  );
}
