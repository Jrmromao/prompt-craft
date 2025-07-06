'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { VoteAbuseType, VoteAbuseSeverity, VoteAbuseStatus } from '@prisma/client';

interface AbuseDetection {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  abuseType: VoteAbuseType;
  severity: VoteAbuseSeverity;
  status: VoteAbuseStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  investigatedBy?: string;
  resolution?: string;
  details: any;
  riskScore: number;
}

interface SystemHealth {
  activeAbuseCases: number;
  pendingInvestigations: number;
  falsePositiveRate: number;
  averageResolutionTime: number;
  systemLoad: {
    votesPerHour: number;
    rewardsPerHour: number;
    abuseDetectionRate: number;
  };
}

interface AbuseStats {
  totalDetections: number;
  byType: Record<VoteAbuseType, number>;
  bySeverity: Record<VoteAbuseSeverity, number>;
  byStatus: Record<VoteAbuseStatus, number>;
  recentTrends: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  topOffenders: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
    detectionCount: number;
    highestSeverity: VoteAbuseSeverity;
    latestDetection: Date;
  }>;
}

export function VoteAbuseManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [abuseStats, setAbuseStats] = useState<AbuseStats | null>(null);
  const [abuseDetections, setAbuseDetections] = useState<AbuseDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoteAbuseStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<VoteAbuseSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VoteAbuseType | 'all'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthResponse, statsResponse, detectionsResponse] = await Promise.all([
        fetch('/api/admin/abuse/system-health'),
        fetch('/api/admin/abuse/statistics'),
        fetch('/api/admin/abuse/detections')
      ]);

      if (!healthResponse.ok || !statsResponse.ok || !detectionsResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const [health, stats, detections] = await Promise.all([
        healthResponse.json(),
        statsResponse.json(),
        detectionsResponse.json()
      ]);

      setSystemHealth(health);
      setAbuseStats(stats);
      setAbuseDetections(detections);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigateCase = async (caseId: string, resolution: string, status: VoteAbuseStatus) => {
    try {
      const response = await fetch(`/api/admin/abuse/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, resolution, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update case');
      }

      // Refresh data
      await loadDashboardData();
    } catch (err) {
      console.error('Error investigating case:', err);
      setError('Failed to update case');
    }
  };

  const getSeverityColor = (severity: VoteAbuseSeverity) => {
    switch (severity) {
      case VoteAbuseSeverity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case VoteAbuseSeverity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case VoteAbuseSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case VoteAbuseSeverity.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: VoteAbuseStatus) => {
    switch (status) {
      case VoteAbuseStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case VoteAbuseStatus.INVESTIGATING: return 'bg-blue-100 text-blue-800 border-blue-200';
      case VoteAbuseStatus.RESOLVED: return 'bg-green-100 text-green-800 border-green-200';
      case VoteAbuseStatus.FALSE_POSITIVE: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: VoteAbuseStatus) => {
    switch (status) {
      case VoteAbuseStatus.PENDING: return <Clock className="w-4 h-4" />;
      case VoteAbuseStatus.INVESTIGATING: return <Eye className="w-4 h-4" />;
      case VoteAbuseStatus.RESOLVED: return <CheckCircle className="w-4 h-4" />;
      case VoteAbuseStatus.FALSE_POSITIVE: return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredDetections = abuseDetections.filter(detection => {
    const matchesSearch = !searchTerm || 
      detection.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detection.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || detection.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || detection.severity === severityFilter;
    const matchesType = typeFilter === 'all' || detection.abuseType === typeFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const paginatedDetections = filteredDetections.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredDetections.length / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {systemHealth?.activeAbuseCases || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.pendingInvestigations || 0} pending investigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.systemLoad.votesPerHour || 0}
            </div>
            <p className="text-xs text-muted-foreground">votes/hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abuse Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.systemLoad.abuseDetectionRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">detection rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.falsePositiveRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg resolution: {systemHealth?.averageResolutionTime.toFixed(1) || 0}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detections">Detections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Detection Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last 24 hours</span>
                    <Badge variant="outline">{abuseStats?.recentTrends.last24h || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last 7 days</span>
                    <Badge variant="outline">{abuseStats?.recentTrends.last7d || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last 30 days</span>
                    <Badge variant="outline">{abuseStats?.recentTrends.last30d || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Offenders */}
            <Card>
              <CardHeader>
                <CardTitle>Top Offenders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {abuseStats?.topOffenders.slice(0, 5).map((offender, index) => (
                    <div key={offender.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {offender.userName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {offender.userEmail || offender.userId}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(offender.highestSeverity)}>
                          {offender.highestSeverity}
                        </Badge>
                        <span className="text-sm font-medium">{offender.detectionCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detections" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VoteAbuseStatus | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={VoteAbuseStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={VoteAbuseStatus.INVESTIGATING}>Investigating</SelectItem>
                      <SelectItem value={VoteAbuseStatus.RESOLVED}>Resolved</SelectItem>
                      <SelectItem value={VoteAbuseStatus.FALSE_POSITIVE}>False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as VoteAbuseSeverity | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value={VoteAbuseSeverity.CRITICAL}>Critical</SelectItem>
                      <SelectItem value={VoteAbuseSeverity.HIGH}>High</SelectItem>
                      <SelectItem value={VoteAbuseSeverity.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={VoteAbuseSeverity.LOW}>Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as VoteAbuseType | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.values(VoteAbuseType).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detections Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Abuse Detections ({filteredDetections.length})</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedDetections.map((detection) => (
                  <div key={detection.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(detection.severity)}>
                          {detection.severity}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(detection.status)}>
                          {getStatusIcon(detection.status)}
                          <span className="ml-1">{detection.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {detection.abuseType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Risk: {detection.riskScore.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(detection.detectedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">User Information</h4>
                        <p className="text-sm text-gray-600">
                          <strong>Name:</strong> {detection.userName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {detection.userEmail || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>ID:</strong> {detection.userId}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-1">Detection Details</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(detection.details, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {detection.status === VoteAbuseStatus.PENDING && (
                      <div className="flex space-x-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleInvestigateCase(detection.id, 'Marked as resolved - legitimate activity', VoteAbuseStatus.RESOLVED)}
                        >
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvestigateCase(detection.id, 'False positive - detection rule needs adjustment', VoteAbuseStatus.FALSE_POSITIVE)}
                        >
                          False Positive
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvestigateCase(detection.id, 'Under investigation', VoteAbuseStatus.INVESTIGATING)}
                        >
                          Investigate
                        </Button>
                      </div>
                    )}

                    {detection.resolution && (
                      <div className="pt-2 border-t">
                        <h4 className="font-medium text-sm mb-1">Resolution</h4>
                        <p className="text-sm text-gray-600">{detection.resolution}</p>
                        {detection.resolvedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Resolved on {new Date(detection.resolvedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDetections.length)} of {filteredDetections.length} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Abuse by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Abuse by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(abuseStats?.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Abuse by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Abuse by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(abuseStats?.bySeverity || {}).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{severity}</span>
                      <Badge className={getSeverityColor(severity as VoteAbuseSeverity)}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Configuration settings will be available in a future update.
                    Currently, abuse detection thresholds are managed through environment variables.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Current Thresholds</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Max votes per hour: 20</li>
                      <li>• Max votes per day: 100</li>
                      <li>• Min account age: 3 days</li>
                      <li>• High risk threshold: 0.8</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" onClick={loadDashboardData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh All Data
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export System Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 