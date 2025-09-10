import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import EnhancedPromptCreateForm from '@/components/EnhancedPromptCreateForm';
import { ModernBreadcrumb } from '@/components/ui/breadcrumb';
import { Home, FileText, Plus } from 'lucide-react';
import type { NavBarUser } from '@/components/layout/NavBar';

export default async function CreatePromptPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const navBarUser: NavBarUser = {
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    imageUrl: user?.imageUrl,
  };

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Prompts",
      href: "/prompts",
      icon: FileText,
    },
    {
      label: "Create New",
      current: true,
      icon: Plus,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-pink-50/80 dark:from-purple-950/20 dark:via-gray-900 dark:to-pink-950/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ModernBreadcrumb 
          items={breadcrumbItems}
          className="mb-8"
        />
      </div>
      <EnhancedPromptCreateForm />
    </div>
  );
}
