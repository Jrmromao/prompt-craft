// Mock all dependencies before imports
const mockAdminAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAdminAuth,
}));

const mockAdminVoteAbuseMonitoringService = {
  getSystemHealth: jest.fn(),
  getAbuseStatistics: jest.fn(),
  getAbuseDetections: jest.fn(),
  investigateAbuse: jest.fn(),
};

jest.mock('@/lib/services/voteAbuseMonitoringService', () => ({
  VoteAbuseMonitoringService: {
    getInstance: () => mockAdminVoteAbuseMonitoringService,
  },
}));

// Mock NextResponse
const mockAdminNextResponse = {
  json: jest.fn((data, options) => ({
    json: () => Promise.resolve(data),
    status: options?.status || 200,
  })),
};

jest.mock('next/server', () => ({
  NextResponse: mockAdminNextResponse,
}));

describe('Admin Abuse API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock - admin user
    mockAdminAuth.mockResolvedValue({ 
      userId: 'admin-user-id',
      sessionClaims: { metadata: { role: 'admin' } },
      sessionId: 'session-123',
      sessionStatus: 'active',
      actor: null,
      isAuthenticated: true
    });
  });

  describe('System Health Endpoint', () => {
    it('should return system health metrics for admin users', async () => {
      const mockHealthData = {
        activeCases: 5,
        pendingInvestigations: 3,
        falsePositiveRate: 0.05,
        averageResolutionTime: 24.5,
        systemStatus: 'healthy',
        lastUpdated: new Date().toISOString(),
      };

      mockAdminVoteAbuseMonitoringService.getSystemHealth.mockResolvedValue(mockHealthData);

      const request = new Request('http://localhost/api/admin/abuse/system-health', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/system-health/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.activeCases).toBe(5);
      expect(data.pendingInvestigations).toBe(3);
      expect(data.falsePositiveRate).toBe(0.05);
      expect(data.systemStatus).toBe('healthy');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockAuth.mockResolvedValue({ 
        userId: null,
        sessionClaims: null,
        sessionId: null,
        sessionStatus: 'no_session',
        actor: null,
        isAuthenticated: false
      });

      const request = new Request('http://localhost/api/admin/abuse/system-health', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/system-health/route');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      mockAuth.mockResolvedValue({ 
        userId: 'regular-user-id',
        sessionClaims: { metadata: { role: 'user' } },
        sessionId: 'session-123',
        sessionStatus: 'active',
        actor: null,
        isAuthenticated: true
      });

      const request = new Request('http://localhost/api/admin/abuse/system-health', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/system-health/route');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Statistics Endpoint', () => {
    it('should return abuse statistics for admin users', async () => {
      const mockStatistics = {
        totalDetections: 150,
        byType: {
          RAPID_VOTING_PATTERN: 45,
          IP_CLUSTERING: 30,
          SUSPICIOUS_ACCOUNT_AGE: 25,
          COORDINATED_VOTING: 20,
          SELF_VOTE_ATTEMPT: 15,
          EXCESSIVE_VOTING_RATE: 10,
          VOTE_MANIPULATION: 5,
        },
        bySeverity: {
          LOW: 60,
          MEDIUM: 50,
          HIGH: 30,
          CRITICAL: 10,
        },
        byStatus: {
          PENDING: 20,
          INVESTIGATING: 15,
          CONFIRMED: 80,
          FALSE_POSITIVE: 25,
          RESOLVED: 10,
        },
        timeRange: '30d',
      };

      mockAdminVoteAbuseMonitoringService.getAbuseStatistics.mockResolvedValue(mockStatistics);

      const request = new Request('http://localhost/api/admin/abuse/statistics?timeRange=30d', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/statistics/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalDetections).toBe(150);
      expect(data.byType.RAPID_VOTING_PATTERN).toBe(45);
      expect(data.bySeverity.CRITICAL).toBe(10);
      expect(data.timeRange).toBe('30d');
    });

    it('should handle custom time periods', async () => {
      const mockStatistics = {
        totalDetections: 75,
        byType: {
          RAPID_VOTING_PATTERN: 25,
          IP_CLUSTERING: 15,
          SUSPICIOUS_ACCOUNT_AGE: 10,
          COORDINATED_VOTING: 10,
          SELF_VOTE_ATTEMPT: 8,
          EXCESSIVE_VOTING_RATE: 4,
          VOTE_MANIPULATION: 3,
        },
        bySeverity: {
          LOW: 30,
          MEDIUM: 25,
          HIGH: 15,
          CRITICAL: 5,
        },
        byStatus: {
          PENDING: 10,
          INVESTIGATING: 8,
          CONFIRMED: 40,
          FALSE_POSITIVE: 12,
          RESOLVED: 5,
        },
        timeRange: '7d',
      };

      mockAdminVoteAbuseMonitoringService.getAbuseStatistics.mockResolvedValue(mockStatistics);

      const request = new Request('http://localhost/api/admin/abuse/statistics?timeRange=7d', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/statistics/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalDetections).toBe(75);
      expect(data.timeRange).toBe('7d');
    });
  });

  describe('Detections Endpoint', () => {
    it('should return abuse detections with pagination', async () => {
      const mockDetections = {
        detections: [
          {
            id: 'detection-1',
            type: 'RAPID_VOTING_PATTERN',
            severity: 'HIGH',
            status: 'PENDING',
            userId: 'user-123',
            promptId: 'prompt-456',
            detectedAt: new Date().toISOString(),
            metadata: {
              votingRate: 15,
              timeWindow: '30s',
              threshold: 5,
            },
          },
          {
            id: 'detection-2',
            type: 'IP_CLUSTERING',
            severity: 'MEDIUM',
            status: 'INVESTIGATING',
            userId: 'user-789',
            promptId: 'prompt-101',
            detectedAt: new Date().toISOString(),
            metadata: {
              ipAddress: '192.168.1.1',
              userCount: 8,
              threshold: 5,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      };

      mockAdminVoteAbuseMonitoringService.getAbuseDetections.mockResolvedValue(mockDetections);

      const request = new Request('http://localhost/api/admin/abuse/detections?page=1&limit=10', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/detections/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.detections).toHaveLength(2);
      expect(data.detections[0].type).toBe('RAPID_VOTING_PATTERN');
      expect(data.detections[1].type).toBe('IP_CLUSTERING');
      expect(data.pagination.total).toBe(25);
    });

    it('should filter detections by type', async () => {
      const mockDetections = {
        detections: [
          {
            id: 'detection-1',
            type: 'RAPID_VOTING_PATTERN',
            severity: 'HIGH',
            status: 'PENDING',
            userId: 'user-123',
            promptId: 'prompt-456',
            detectedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockAdminVoteAbuseMonitoringService.getAbuseDetections.mockResolvedValue(mockDetections);

      const request = new Request('http://localhost/api/admin/abuse/detections?type=RAPID_VOTING_PATTERN', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/detections/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.detections).toHaveLength(1);
      expect(data.detections[0].type).toBe('RAPID_VOTING_PATTERN');
    });

    it('should filter detections by severity', async () => {
      const mockDetections = {
        detections: [
          {
            id: 'detection-1',
            type: 'COORDINATED_VOTING',
            severity: 'CRITICAL',
            status: 'PENDING',
            userId: 'user-123',
            promptId: 'prompt-456',
            detectedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      };

      mockAdminVoteAbuseMonitoringService.getAbuseDetections.mockResolvedValue(mockDetections);

      const request = new Request('http://localhost/api/admin/abuse/detections?severity=CRITICAL', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/detections/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.detections).toHaveLength(1);
      expect(data.detections[0].severity).toBe('CRITICAL');
    });
  });

  describe('Investigation Endpoint', () => {
    it('should allow admin to investigate abuse cases', async () => {
      const mockInvestigationResult = {
        id: 'investigation-123',
        detectionId: 'detection-1',
        investigatorId: 'admin-user-id',
        status: 'INVESTIGATING',
        findings: 'Initial investigation started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAdminVoteAbuseMonitoringService.investigateAbuse.mockResolvedValue(mockInvestigationResult);

      const request = new Request('http://localhost/api/admin/abuse/investigate', {
        method: 'POST',
        body: JSON.stringify({
          detectionId: 'detection-1',
          action: 'start_investigation',
          notes: 'Starting investigation of suspicious voting pattern',
        }),
        headers: { 'content-type': 'application/json' },
      });

      const { POST } = require('@/app/api/admin/abuse/investigate/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('investigation-123');
      expect(data.status).toBe('INVESTIGATING');
      expect(data.investigatorId).toBe('admin-user-id');
    });

    it('should allow admin to resolve abuse cases', async () => {
      const mockResolutionResult = {
        id: 'investigation-123',
        detectionId: 'detection-1',
        investigatorId: 'admin-user-id',
        status: 'RESOLVED',
        findings: 'Confirmed abuse - user suspended',
        resolution: 'USER_SUSPENDED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAdminVoteAbuseMonitoringService.investigateAbuse.mockResolvedValue(mockResolutionResult);

      const request = new Request('http://localhost/api/admin/abuse/investigate', {
        method: 'POST',
        body: JSON.stringify({
          detectionId: 'detection-1',
          action: 'resolve',
          resolution: 'USER_SUSPENDED',
          notes: 'User confirmed to be gaming the system',
        }),
        headers: { 'content-type': 'application/json' },
      });

      const { POST } = require('@/app/api/admin/abuse/investigate/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('RESOLVED');
      expect(data.resolution).toBe('USER_SUSPENDED');
    });

    it('should allow admin to mark cases as false positives', async () => {
      const mockFalsePositiveResult = {
        id: 'investigation-123',
        detectionId: 'detection-1',
        investigatorId: 'admin-user-id',
        status: 'FALSE_POSITIVE',
        findings: 'Legitimate user behavior',
        resolution: 'FALSE_POSITIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockAdminVoteAbuseMonitoringService.investigateAbuse.mockResolvedValue(mockFalsePositiveResult);

      const request = new Request('http://localhost/api/admin/abuse/investigate', {
        method: 'POST',
        body: JSON.stringify({
          detectionId: 'detection-1',
          action: 'mark_false_positive',
          notes: 'User behavior is legitimate',
        }),
        headers: { 'content-type': 'application/json' },
      });

      const { POST } = require('@/app/api/admin/abuse/investigate/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('FALSE_POSITIVE');
      expect(data.resolution).toBe('FALSE_POSITIVE');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockAdminVoteAbuseMonitoringService.getSystemHealth.mockRejectedValue(
        new Error('Service unavailable')
      );

      const request = new Request('http://localhost/api/admin/abuse/system-health', {
        method: 'GET',
      });

      const { GET } = require('@/app/api/admin/abuse/system-health/route');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should validate investigation request parameters', async () => {
      const request = new Request('http://localhost/api/admin/abuse/investigate', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required detectionId
          action: 'start_investigation',
        }),
        headers: { 'content-type': 'application/json' },
      });

      const { POST } = require('@/app/api/admin/abuse/investigate/route');
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
}); 