'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and API integration</p>
      </div>

      <div className="space-y-6">
        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>API Keys</CardTitle>
                <p className="text-sm text-gray-600">Manage your SDK authentication keys</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              API key management coming soon. For now, contact support to get your API key.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm font-medium mb-2">SDK Integration Example</div>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import PromptCraft from 'promptcraft-sdk';

const promptcraft = new PromptCraft({
  apiKey: 'your-api-key-here'
});`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Link href="/settings/billing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <p className="text-sm text-gray-600">Current plan: Free (1,000 runs/month)</p>
                  </div>
                </div>
                <Button variant="ghost">Manage →</Button>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-medium">{user?.primaryEmailAddress?.emailAddress}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Plan</div>
                <div className="font-medium">Free</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Usage This Month</div>
                <div className="font-medium">0 / 1,000 runs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
