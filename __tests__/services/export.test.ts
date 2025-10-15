import { ExportService } from '@/lib/services/exportService';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    promptRun: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/analyticsService', () => ({
  AnalyticsService: {
    getInstance: jest.fn().mockReturnValue({
      getOverview: jest.fn().mockResolvedValue({
        totalRuns: 100,
        totalCost: 10.5,
        avgCostPerRun: 0.105,
        successRate: 95,
        avgLatency: 1200,
      }),
      getModelBreakdown: jest.fn().mockResolvedValue([]),
      getTimeSeriesData: jest.fn().mockResolvedValue([]),
      getMostExpensivePrompts: jest.fn().mockResolvedValue([]),
    }),
  },
}));

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    service = ExportService.getInstance();
    jest.clearAllMocks();
  });

  it('should export to CSV', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.promptRun.findMany.mockResolvedValue([
      {
        createdAt: new Date('2024-01-15'),
        promptId: 'p1',
        model: 'gpt-4',
        provider: 'openai',
        tokensUsed: 100,
        cost: 0.003,
        latency: 1200,
        success: true,
      },
    ]);

    const csv = await service.exportToCSV('user1', new Date(), new Date());
    
    expect(csv).toContain('Date,Prompt ID,Model,Provider,Tokens,Cost,Latency,Success');
    expect(csv).toContain('p1,gpt-4,openai,100,0.0030,1200,Yes');
  });

  it('should export to JSON', async () => {
    const data = await service.exportToJSON('user1', new Date(), new Date());
    
    expect(data).toHaveProperty('overview');
    expect(data).toHaveProperty('modelBreakdown');
    expect(data).toHaveProperty('timeSeries');
    expect(data).toHaveProperty('exportedAt');
  });

  it('should generate report with recommendations', async () => {
    const report = await service.generateReport('user1', new Date(), new Date());
    
    expect(report).toHaveProperty('title');
    expect(report).toHaveProperty('summary');
    expect(report.summary.totalRuns).toBe(100);
    expect(report.summary.totalCost).toBe('$10.50');
  });
});
