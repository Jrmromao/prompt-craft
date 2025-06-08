'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  BarChart2,
  Settings,
  Shield,
  LayoutDashboard,
  MessageSquare,
  FileText,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Moderation', href: '/admin/moderation', icon: Shield },
  { name: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
  { name: 'Email Templates', href: '/admin/email-templates', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
