"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VoteButton } from '@/components/VoteButton';
// import { Comments } from '@/components/Comments';
import {CommentLite } from '@/components/CommentLite'
import { Analytics } from '@/components/Analytics';
import { VersionHistory } from '@/components/VersionHistory';
import { NavBar } from '@/components/layout/NavBar';
import { ArrowLeft, Share2, BookmarkPlus, Copy } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Comments } from './Comments';

interface Tag {
  id: string;
  name: string;
}

interface Prompt {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  upvotes: number;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptContentProps {
  user?: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  prompt: Prompt;
}

export function PromptContent({ user, prompt }: PromptContentProps) {
  const displayName = user?.name || 'Guest';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Prompt</h1>
        <section className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-lg p-8">
          <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
            {/* Prompt content goes here */}
            <p>This is the prompt content. User: {displayName}</p>
          </div>
        </section>
      </main>
    </div>
  );
} 