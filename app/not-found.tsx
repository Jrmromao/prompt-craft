import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Browse Docs
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-600 mb-4">Popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
              Analytics
            </Link>
            <Link href="/settings" className="text-sm text-blue-600 hover:underline">
              Settings
            </Link>
            <Link href="/pricing" className="text-sm text-blue-600 hover:underline">
              Pricing
            </Link>
            <Link href="/docs/quickstart" className="text-sm text-blue-600 hover:underline">
              Quick Start
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
