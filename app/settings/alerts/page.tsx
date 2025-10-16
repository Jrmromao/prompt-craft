'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, DollarSign, AlertTriangle, Clock, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState({
    costSpike: { enabled: false, threshold: 50 },
    errorRate: { enabled: false, threshold: 10 },
    slowResponse: { enabled: false, threshold: 2000 },
    invalidApiKey: { enabled: true },
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        // Merge with defaults to ensure all fields exist
        setAlerts({
          costSpike: data.costSpike || { enabled: false, threshold: 50 },
          errorRate: data.errorRate || { enabled: false, threshold: 10 },
          slowResponse: data.slowResponse || { enabled: false, threshold: 2000 },
          invalidApiKey: data.invalidApiKey || { enabled: true },
        });
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alerts),
      });

      if (res.ok) {
        toast.success('Alert settings saved!');
      } else {
        toast.error('Failed to save alert settings');
      }
    } catch (error) {
      console.error('Failed to save alerts:', error);
      toast.error('Failed to save alert settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Alert Settings</h1>
        <p className="text-gray-600">Configure email notifications for important events</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-red-500" />
            Invalid API Key Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email me when API key is invalid</Label>
              <p className="text-sm text-gray-500 mt-1">
                Get notified immediately if your API key expires or becomes invalid
              </p>
            </div>
            <Switch
              checked={alerts.invalidApiKey.enabled}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, invalidApiKey: { enabled: checked } })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            Cost Spike Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable email alerts for cost spikes</Label>
            <Switch
              checked={alerts.costSpike.enabled}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, costSpike: { ...alerts.costSpike, enabled: checked } })
              }
            />
          </div>
          {alerts.costSpike.enabled && (
            <div>
              <Label>Alert when daily cost exceeds</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">$</span>
                <Input
                  type="number"
                  value={alerts.costSpike.threshold}
                  onChange={(e) =>
                    setAlerts({
                      ...alerts,
                      costSpike: { ...alerts.costSpike, threshold: Number(e.target.value) },
                    })
                  }
                  className="w-32"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Error Rate Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable email alerts for high error rates</Label>
            <Switch
              checked={alerts.errorRate.enabled}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, errorRate: { ...alerts.errorRate, enabled: checked } })
              }
            />
          </div>
          {alerts.errorRate.enabled && (
            <div>
              <Label>Alert when error rate exceeds</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={alerts.errorRate.threshold}
                  onChange={(e) =>
                    setAlerts({
                      ...alerts,
                      errorRate: { ...alerts.errorRate, threshold: Number(e.target.value) },
                    })
                  }
                  className="w-32"
                />
                <span className="text-2xl">%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Slow Response Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable email alerts for slow responses</Label>
            <Switch
              checked={alerts.slowResponse.enabled}
              onCheckedChange={(checked) =>
                setAlerts({
                  ...alerts,
                  slowResponse: { ...alerts.slowResponse, enabled: checked },
                })
              }
            />
          </div>
          {alerts.slowResponse.enabled && (
            <div>
              <Label>Alert when response time exceeds</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={alerts.slowResponse.threshold}
                  onChange={(e) =>
                    setAlerts({
                      ...alerts,
                      slowResponse: {
                        ...alerts.slowResponse,
                        threshold: Number(e.target.value),
                      },
                    })
                  }
                  className="w-32"
                />
                <span>ms</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Alert Settings'}
        </Button>
      </div>
    </div>
  );
}
