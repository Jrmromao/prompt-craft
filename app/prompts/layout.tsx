import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Prompt Management',
  description: 'Manage your saved prompts and templates',
};

interface PromptsLayoutProps {
  children: React.ReactNode;
}

export default function PromptsLayout({ children }: PromptsLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 