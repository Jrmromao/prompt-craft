// components/CookieConsent/CookieManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Settings2, Download, Trash2 } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  cookies: Cookie[];
}

interface Cookie {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  preferences: boolean;
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the website to function properly',
    required: true,
    enabled: true,
    cookies: [
      {
        name: 'session',
        provider: 'CostLens',
        purpose: 'Maintains user session',
        expiry: 'Session',
      },
      {
        name: 'csrf',
        provider: 'CostLens',
        purpose: 'Security protection',
        expiry: 'Session',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website',
    required: false,
    enabled: false,
    cookies: [
      {
        name: '_ga',
        provider: 'Google Analytics',
        purpose: 'Distinguishes unique users',
        expiry: '2 years',
      },
      {
        name: '_gid',
        provider: 'Google Analytics',
        purpose: 'Distinguishes users',
        expiry: '24 hours',
      },
    ],
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization',
    required: false,
    enabled: false,
    cookies: [
      {
        name: 'theme',
        provider: 'CostLens',
        purpose: 'Stores user theme preference',
        expiry: '1 year',
      },
      {
        name: 'language',
        provider: 'CostLens',
        purpose: 'Stores user language preference',
        expiry: '1 year',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to track visitors across websites for advertising purposes',
    required: false,
    enabled: false,
    cookies: [
      {
        name: '_fbp',
        provider: 'Facebook',
        purpose: 'Used by Facebook to deliver advertisements',
        expiry: '3 months',
      },
      {
        name: 'ads_prefs',
        provider: 'Google Ads',
        purpose: 'Stores advertising preferences',
        expiry: '13 months',
      },
    ],
  },
];

export default function CookieManager() {
  const [categories, setCategories] = useState<CookieCategory[]>(cookieCategories);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('cookie-preferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          enabled: preferences[category.id] ?? category.enabled,
        }))
      );
    }
  }, []);

  const handleCategoryToggle = (categoryId: string, enabled: boolean) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, enabled } : category
      )
    );
  };

  const savePreferences = () => {
    const preferences = categories.reduce(
      (acc, category) => ({
        ...acc,
        [category.id]: category.enabled,
      }),
      {}
    );
    const timestamp = new Date().toISOString();
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-timestamp', timestamp);
    setIsOpen(false);
    
    // Trigger window event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
      detail: { preferences, timestamp }
    }));
  };

  const exportPreferences = () => {
    const data = {
      preferences: categories.reduce(
        (acc, category) => ({
          ...acc,
          [category.id]: category.enabled,
        }),
        {}
      ),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookie-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllCookies = () => {
    // Clear all non-essential cookies
    categories
      .filter((category) => !category.required)
      .forEach((category) => {
        category.cookies.forEach((cookie) => {
          document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        });
      });
    // Reset preferences
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        enabled: category.required,
      }))
    );
    localStorage.removeItem('cookie-preferences');
    localStorage.removeItem('cookie-consent-timestamp');
    
    // Trigger window event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
      detail: { preferences: {}, timestamp: null }
    }));
  };

  const withdrawConsent = () => {
    if (confirm('Are you sure you want to withdraw all cookie consent? This will disable all non-essential cookies and you will be asked for consent again.')) {
      clearAllCookies();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Cookie Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cookie Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="details">Cookie Details</TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="mb-4 rounded-lg border p-4 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {category.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                      <Switch
                        checked={category.enabled}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(category.id, checked)
                        }
                        disabled={category.required}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="mb-4 rounded-lg border p-4 dark:border-gray-800"
                >
                  <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                  <div className="space-y-2">
                    {category.cookies.map((cookie) => (
                      <div
                        key={cookie.name}
                        className="rounded-md bg-gray-50 p-3 dark:bg-gray-900"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{cookie.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Provider: {cookie.provider}
                            </p>
                          </div>
                          <Badge variant="outline">{cookie.expiry}</Badge>
                        </div>
                        <p className="mt-1 text-sm">{cookie.purpose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-between border-t pt-4 dark:border-gray-800">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPreferences}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={withdrawConsent}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Withdraw Consent
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePreferences}>Save Preferences</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
