'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      
      toast.success('Account deletion request received');
      // Redirect to home page after successful deletion request
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
            <CardDescription>
              Manage your personal data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Export Your Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download a copy of all your personal data in JSON format
              </p>
              <Button 
                onClick={handleExportData}
                disabled={isLoading}
              >
                Export Data
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data
              </p>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Processing</CardTitle>
            <CardDescription>
              Manage how your data is processed and used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Communications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and promotions
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await fetch('/api/gdpr/consent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          purpose: 'marketing',
                          granted: true,
                        }),
                      });
                      toast.success('Preferences updated');
                    } catch (error) {
                      toast.error('Failed to update preferences');
                    }
                  }}
                >
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Help us improve by sharing usage data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await fetch('/api/gdpr/consent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          purpose: 'analytics',
                          granted: true,
                        }),
                      });
                      toast.success('Preferences updated');
                    } catch (error) {
                      toast.error('Failed to update preferences');
                    }
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 