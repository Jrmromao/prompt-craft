'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Trash2, Shield, Settings } from 'lucide-react';

export default function PrivacySettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(true); // Assume fetched from API
  const [analyticsConsent, setAnalyticsConsent] = useState(true); // Assume fetched from API

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gdpr/export', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      
      // Create a blob with the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show more detailed success message
      toast.success(
        'Your data has been exported successfully. You will receive an email confirmation shortly.'
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export your data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch('/api/gdpr/delete', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to delete account');
      
      // Show more detailed success message
      toast.success(
        'Account deletion request received. You will receive an email confirmation shortly. Your account will be permanently deleted within 30 days.'
      );
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeleteConfirm('');
    }
  };

  const handleConsentChange = async (purpose: 'marketing' | 'analytics', granted: boolean) => {
    const previousValue = purpose === 'marketing' ? marketingConsent : analyticsConsent;
    try {
      const response = await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, granted }),
      });
      
      if (!response.ok) throw new Error('Failed to update preferences');
      
      if (purpose === 'marketing') setMarketingConsent(granted);
      if (purpose === 'analytics') setAnalyticsConsent(granted);
      
      // Show success message with more details
      toast.success(
        `Your ${purpose} preferences have been updated. You will receive an email confirmation shortly.`
      );
    } catch (error) {
      // Revert UI state on error
      if (purpose === 'marketing') setMarketingConsent(previousValue);
      if (purpose === 'analytics') setAnalyticsConsent(previousValue);
      toast.error('Failed to update preferences. Please try again.');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="text-muted-foreground">Manage your data and privacy preferences</p>
        </div>
      </div>

      {/* Export Data Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Download className="h-6 w-6 text-purple-500" />
          <div>
            <CardTitle>Export My Data</CardTitle>
            <CardDescription>Download all your personal data as JSON.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExportData} 
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Trash2 className="h-6 w-6 text-red-500" />
          <div>
            <CardTitle className="text-red-600">Delete My Account</CardTitle>
            <CardDescription>Permanently delete your account and all data.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Data Preferences Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Settings className="h-6 w-6 text-purple-500" />
          <div>
            <CardTitle>Data Preferences</CardTitle>
            <CardDescription>Control how your data is used.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Allow Marketing Emails</div>
              <div className="text-sm text-muted-foreground">Receive updates about new features and promotions.</div>
            </div>
            <Switch
              checked={marketingConsent}
              onCheckedChange={v => handleConsentChange('marketing', v)}
              aria-label="Allow Marketing Emails"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Share Usage Analytics</div>
              <div className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data.</div>
            </div>
            <Switch
              checked={analyticsConsent}
              onCheckedChange={v => handleConsentChange('analytics', v)}
              aria-label="Share Usage Analytics"
            />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <div className="flex gap-6 mt-4 text-sm">
        <a href="/privacy-policy" className="text-purple-600 hover:underline">Privacy Policy</a>
        <a href="/contact" className="text-muted-foreground hover:underline">Contact Support</a>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Confirm Account Deletion
            </h2>
            <p className="mb-4 text-muted-foreground">
              This action is <b>permanent</b> and cannot be undone.<br />
              To confirm, type <span className="font-mono bg-zinc-100 px-2 py-1 rounded">DELETE</span> below:
            </p>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount} 
                disabled={isLoading || deleteConfirm !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 