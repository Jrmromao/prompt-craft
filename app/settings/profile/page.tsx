'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Shield, LogOut, Trash2, Lock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    console.log('Delete account');
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{user?.fullName || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Member since</p>
              <p className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-medium">Pro - $9/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}`, '_blank')}
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setShowSignOutDialog(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Once you delete your account, there is no going back. All your data, API keys, and usage history will be permanently deleted.
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the home page. You can sign back in anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-gray-900">This action cannot be undone. This will permanently:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Delete all your API keys</li>
                <li>Remove all usage data and analytics</li>
                <li>Cancel your subscription</li>
                <li>Delete your account information</li>
              </ul>
              <p className="text-red-600 font-medium mt-4">
                Are you absolutely sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
