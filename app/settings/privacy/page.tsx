'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const [consents, setConsents] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current consent preferences
    const stored = localStorage.getItem('cookie-consent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsents(parsed);
      } catch (error) {
        console.error('Failed to parse consent:', error);
      }
    }
    setLoading(false);
  }, []);

  const updateConsent = async (type: string, granted: boolean) => {
    const updated = { ...consents, [type]: granted };
    setConsents(updated);

    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...updated,
      timestamp: new Date().toISOString(),
    }));

    // Track in database
    try {
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentType: 'cookies',
          granted,
          preferences: updated,
        }),
      });
      toast.success('Consent preferences updated');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Privacy & Consent</h1>
        <p className="text-gray-600 mt-2">Manage your data and cookie preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Necessary Cookies</h3>
              <p className="text-sm text-gray-600">
                Required for the website to function. Cannot be disabled.
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Analytics Cookies</h3>
              <p className="text-sm text-gray-600">
                Help us understand how you use our service to improve it.
              </p>
            </div>
            <Switch
              checked={consents.analytics}
              onCheckedChange={(checked) => updateConsent('analytics', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Marketing Cookies</h3>
              <p className="text-sm text-gray-600">
                Currently not used. Reserved for future features.
              </p>
            </div>
            <Switch
              checked={consents.marketing}
              onCheckedChange={(checked) => updateConsent('marketing', checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights (GDPR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Export Your Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download all your data in JSON format
            </p>
            <Button variant="outline" asChild>
              <a href="/api/gdpr/export">Download Data</a>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 text-red-600">Delete Your Account</h3>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
              Data will be soft-deleted for 30 days, then permanently removed.
            </p>
            <Button variant="destructive" asChild>
              <a href="/settings/privacy/delete">Delete Account</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Legal basis:</strong> Consent and contract performance
          </p>
          <p>
            <strong>Data location:</strong> EU and US (with adequate safeguards)
          </p>
          <p>
            <strong>Retention:</strong> See table above
          </p>
          <p>
            <strong>Your rights:</strong> Access, rectification, erasure, portability, objection
          </p>
          <p>
            <strong>Contact:</strong>{' '}
            <a href="mailto:privacy@prompthive.co" className="text-blue-600 hover:underline">
              privacy@prompthive.co
            </a>
          </p>
          <p>
            <strong>Response time:</strong> Within 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
