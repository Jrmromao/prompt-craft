'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Mail, Crown, Clock } from 'lucide-react';

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">Invite team members to collaborate</p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Coming Soon
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Team collaboration features are currently in development. You'll be able to invite team members, 
                share API keys, and collaborate on prompt optimization soon.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Crown className="w-4 h-4" />
                <span>Available for Enterprise plan users first</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview UI (Disabled) */}
      <Card className="opacity-60 pointer-events-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                Y
              </div>
              <div>
                <p className="font-medium">You</p>
                <p className="text-sm text-muted-foreground">owner@example.com</p>
              </div>
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
              Owner
            </span>
          </div>

          {/* Invite Form */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Invite Team Member</h3>
            <div className="flex gap-2">
              <Input 
                placeholder="colleague@company.com" 
                disabled
                className="flex-1"
              />
              <Button disabled>
                <Mail className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notify Me */}
      <Card>
        <CardHeader>
          <CardTitle>Get Notified</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Want to be notified when team features launch? We'll send you an email.
          </p>
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
