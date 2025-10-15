'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Bell, CreditCard, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your PromptCraft API keys for SDK integration</CardDescription>
                </div>
              </div>
              <Button variant="outline">Manage Keys</Button>
            </div>
          </CardHeader>
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
                    <CardDescription>Manage your plan, payment methods, and invoices</CardDescription>
                  </div>
                </div>
                <Button variant="ghost">View →</Button>
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Budget Alerts</CardTitle>
                  <CardDescription>Set spending limits and get notified before you exceed them</CardDescription>
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Invite team members and manage permissions</CardDescription>
                </div>
              </div>
              <Button variant="outline">Manage Team</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Privacy */}
        <Link href="/settings/privacy">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Manage your privacy settings and data retention</CardDescription>
                  </div>
                </div>
                <Button variant="ghost">View →</Button>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Account Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">Free</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
