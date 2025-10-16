'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, DollarSign, AlertTriangle, Clock } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState({
    costSpike: { enabled: false, threshold: 50 },
    errorRate: { enabled: false, threshold: 10 },
    slowResponse: { enabled: false, threshold: 2000 },
  });

  const handleSave = async () => {
    // TODO: Save to API
    alert('Alerts saved! You will receive email notifications.');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Alerts</h1>
        <p className="text-gray-600 mt-1">Get notified when important events happen</p>
      </div>

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
            High Error Rate Alert
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
                setAlerts({ ...alerts, slowResponse: { ...alerts.slowResponse, enabled: checked } })
              }
            />
          </div>
          {alerts.slowResponse.enabled && (
            <div>
              <Label>Alert when average latency exceeds</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  value={alerts.slowResponse.threshold}
                  onChange={(e) =>
                    setAlerts({
                      ...alerts,
                      slowResponse: { ...alerts.slowResponse, threshold: Number(e.target.value) },
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

      <Button onClick={handleSave} size="lg" className="w-full">
        <Bell className="w-4 h-4 mr-2" />
        Save Alert Settings
      </Button>
    </div>
  );
}
