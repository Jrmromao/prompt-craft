'use client';
import Playground from '../../components/Playground';
import { ModernBreadcrumb } from '@/components/ui/breadcrumb';
import { Home, Play } from 'lucide-react';

export default function PlaygroundPage() {
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Playground",
      current: true,
      icon: Play,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-blue-50/80 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ModernBreadcrumb 
          items={breadcrumbItems}
          className="mb-8"
        />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-500 text-transparent font-inter">
            Prompt Playground
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">
            Test and experiment with your prompts in real-time
          </p>
        </div>
        <Playground />
      </div>
    </div>
  );
}
