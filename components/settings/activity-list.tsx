interface ActivityListProps {
  activities: any[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity found.</p>
      ) : (
        activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action || 'Activity'}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp || 'Recently'}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
