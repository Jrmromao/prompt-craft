import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PromptAnalyticsContextValue {
  copyCount: number;
  setCopyCount: (count: number) => void;
  incrementCopyCount: () => void;
  viewCount: number;
  setViewCount: (count: number) => void;
  incrementViewCount: () => void;
  usageCount: number;
  setUsageCount: (count: number) => void;
  incrementUsageCount: () => void;
  commentCount: number;
  setCommentCount: (count: number) => void;
  incrementCommentCount: () => void;
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
  initialCopyCount: number;
  initialViewCount: number;
  initialUsageCount: number;
  initialCommentCount: number;
  children: ReactNode;
}

export function PromptAnalyticsProvider({ initialCopyCount, initialViewCount, initialUsageCount, initialCommentCount, children }: PromptAnalyticsProviderProps) {
  const [copyCount, setCopyCount] = useState(initialCopyCount);
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [usageCount, setUsageCount] = useState(initialUsageCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  const incrementCopyCount = () => setCopyCount((c) => c + 1);
  const incrementViewCount = () => setViewCount((c) => c + 1);
  const incrementUsageCount = () => setUsageCount((c) => c + 1);
  const incrementCommentCount = () => setCommentCount((c) => c + 1);

  return (
    <PromptAnalyticsContext.Provider value={{ copyCount, setCopyCount, incrementCopyCount, viewCount, setViewCount, incrementViewCount, usageCount, setUsageCount, incrementUsageCount, commentCount, setCommentCount, incrementCommentCount }}>
      {children}
    </PromptAnalyticsContext.Provider>
  );
} 