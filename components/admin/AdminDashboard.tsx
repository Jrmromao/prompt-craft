'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Ban, Eye, TrendingDown } from 'lucide-react';

interface AbuseReport {
  id: string;
  userId: string;
  type: 'vote_abuse' | 'spam' | 'injection' | 'rate_limit';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  details: string;
}

interface AdminStats {
  totalReports: number;
  blockedIPs: number;
  suspendedUsers: number;
  recentReports: AbuseReport[];
}

export function AdminDashboard({ stats, onBlockUser, onBlockIP }: {
  stats: AdminStats;
  onBlockUser: (userId: string) => void;
  onBlockIP: (ip: string) => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ban className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold">{stats.blockedIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Suspended Users</p>
                <p className="text-2xl font-bold">{stats.suspendedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Abuse Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getSeverityColor(report.severity) as any}>
                      {report.severity}
                    </Badge>
                    <span className="font-medium">{report.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User: {report.userId} • {new Date(report.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">{report.details}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onBlockUser(report.userId)}>
                    Block User
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onBlockIP('127.0.0.1')}>
                    Block IP
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
