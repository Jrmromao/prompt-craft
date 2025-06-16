import { AuditLogEntry } from "@/lib/services/auditService";
import {
  SettingsIcon,
  UserIcon,
  KeyIcon,
  BellIcon,
  CreditCardIcon,
  LockIcon,
} from "lucide-react";

interface ActivityListProps {
  activities: AuditLogEntry[];
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'SETTINGS_CHANGED':
      return <SettingsIcon className="h-4 w-4" />;
    case 'USER_UPDATED':
      return <UserIcon className="h-4 w-4" />;
    case 'API_KEY_CREATED':
    case 'API_KEY_DELETED':
      return <KeyIcon className="h-4 w-4" />;
    case 'NOTIFICATION_SETTINGS_UPDATED':
      return <BellIcon className="h-4 w-4" />;
    case 'PAYMENT_METHOD_UPDATED':
    case 'SUBSCRIPTION_CHANGED':
      return <CreditCardIcon className="h-4 w-4" />;
    case 'PASSWORD_CHANGED':
    case '2FA_ENABLED':
    case '2FA_DISABLED':
      return <LockIcon className="h-4 w-4" />;
    default:
      return <SettingsIcon className="h-4 w-4" />;
  }
}

function formatActivityMessage(action: string, resource: string) {
  const actionMap: Record<string, string> = {
    SETTINGS_CHANGED: 'Updated settings',
    USER_UPDATED: 'Updated profile',
    USER_GET_PROFILE: 'Viewed profile',
    API_KEY_CREATED: 'Created API key',
    API_KEY_DELETED: 'Deleted API key',
    NOTIFICATION_SETTINGS_UPDATED: 'Updated notification settings',
    PAYMENT_METHOD_UPDATED: 'Updated payment method',
    SUBSCRIPTION_CHANGED: 'Changed subscription',
    PASSWORD_CHANGED: 'Changed password',
    '2FA_ENABLED': 'Enabled 2FA',
    '2FA_DISABLED': 'Disabled 2FA',
  };

  return actionMap[action] || action.replace(/_/g, ' ').toLowerCase();
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function ActivityList({ activities }: ActivityListProps) {
  console.log('ActivityList received activities:', activities);

  if (!activities.length) {
    console.log('No activities to display');
    return (
      <div className="text-center text-muted-foreground py-8">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        console.log('Rendering activity:', activity);
        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">
                {formatActivityMessage(activity.action, activity.resource)}
              </p>
              {activity.details && typeof activity.details === 'string' && (
                <p className="text-sm text-muted-foreground">{activity.details}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(activity.timestamp ? new Date(activity.timestamp) : new Date())}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 