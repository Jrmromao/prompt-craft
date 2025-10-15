'use client';

import { TemplateLibrary } from '@/components/TemplateLibrary';
import { ModernBreadcrumb } from '@/components/ui/breadcrumb';
import { Home, FileText } from 'lucide-react';

export default function TemplatesPage() {
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Templates",
      current: true,
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-blue-50/80">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ModernBreadcrumb 
          items={breadcrumbItems}
          className="mb-8"
        />
        <TemplateLibrary />
      </div>
    </div>
  );
}
