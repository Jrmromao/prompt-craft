import { TeamService } from '@/lib/services/teamService';
import { AlertService } from '@/lib/services/alertService';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    teamMember: {
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    alert: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    promptRun: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    service = TeamService.getInstance();
    jest.clearAllMocks();
  });

  it('should invite team member', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      planType: 'PRO',
    });
    prisma.teamMember.count.mockResolvedValue(2);
    prisma.teamMember.create.mockResolvedValue({
      id: 'member1',
      email: 'test@example.com',
      role: 'MEMBER',
    });

    const member = await service.inviteMember('user1', 'test@example.com');
    
    expect(member.email).toBe('test@example.com');
    expect(prisma.teamMember.create).toHaveBeenCalled();
  });

  it('should enforce team member limits', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      planType: 'STARTER',
    });
    prisma.teamMember.count.mockResolvedValue(3); // At limit

    await expect(
      service.inviteMember('user1', 'test@example.com')
    ).rejects.toThrow('Team member limit reached');
  });
});

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = AlertService.getInstance();
    jest.clearAllMocks();
  });

  it('should create alert', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.alert.create.mockResolvedValue({
      id: 'alert1',
      type: 'COST_SPIKE',
      threshold: 100,
    });

    const alert = await service.createAlert('user1', 'COST_SPIKE', 100);
    
    expect(alert.type).toBe('COST_SPIKE');
    expect(alert.threshold).toBe(100);
  });

  it('should detect cost spike', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.alert.findMany.mockResolvedValue([
      { id: 'alert1', type: 'COST_SPIKE', threshold: 50, enabled: true },
    ]);

    prisma.promptRun.findMany.mockResolvedValue([
      { cost: 30, success: true, latency: 100 },
      { cost: 40, success: true, latency: 100 },
    ]);

    prisma.notification.create.mockResolvedValue({});

    const triggered = await service.checkAlerts('user1');
    
    expect(triggered.length).toBe(1);
    expect(triggered[0].type).toBe('COST_SPIKE');
  });

  it('should detect high error rate', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.alert.findMany.mockResolvedValue([
      { id: 'alert1', type: 'HIGH_ERROR_RATE', threshold: 20, enabled: true },
    ]);

    prisma.promptRun.findMany.mockResolvedValue([
      { cost: 1, success: false, latency: 100 },
      { cost: 1, success: false, latency: 100 },
      { cost: 1, success: true, latency: 100 },
      { cost: 1, success: true, latency: 100 },
    ]);

    prisma.notification.create.mockResolvedValue({});

    const triggered = await service.checkAlerts('user1');
    
    expect(triggered.length).toBe(1);
    expect(triggered[0].type).toBe('HIGH_ERROR_RATE');
  });
});
