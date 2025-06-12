import React from 'react';
import { useRealtimeUsage } from '@/hooks/useRealtimeUsage';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RealtimeUsageDisplayProps {
  feature?: string;
  title?: string;
  showProgress?: boolean;
  className?: string;
}

export function RealtimeUsageDisplay({
  feature,
  title = 'Usage',
  showProgress = true,
  className = '',
}: RealtimeUsageDisplayProps) {
  const { usage, loading, error } = useRealtimeUsage(feature);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            {showProgress && <div className="h-2 bg-gray-200 rounded"></div>}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load usage data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!usage) {
    return null;
  }

  const renderUsageContent = () => {
    if (typeof usage === 'number') {
      return (
        <div className="space-y-4">
          <div className="text-2xl font-bold">{usage}</div>
          {showProgress && (
            <Progress value={usage} className="h-2" />
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(usage).map(([feature, count]) => (
          <div key={feature} className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium capitalize">
                {feature.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-gray-500">{count}</span>
            </div>
            {showProgress && (
              <Progress value={count} className="h-2" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderUsageContent()}
      </CardContent>
    </Card>
  );
} 