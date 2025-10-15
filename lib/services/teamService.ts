import { prisma } from '@/lib/prisma';

export class TeamService {
  private static instance: TeamService;

  static getInstance(): TeamService {
    if (!this.instance) {
      this.instance = new TeamService();
    }
    return this.instance;
  }

  async inviteMember(userId: string, email: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Check team limit
    const teamCount = await prisma.teamMember.count({ where: { userId } });
    const { PLANS } = await import('@/lib/plans');
    const plan = PLANS[user.planType as keyof typeof PLANS] || PLANS.FREE;
    
    if (plan.limits.teamMembers !== -1 && teamCount >= plan.limits.teamMembers) {
      throw new Error('Team member limit reached');
    }

    return prisma.teamMember.create({
      data: { userId, email, role, status: 'PENDING' },
    });
  }

  async removeMember(userId: string, memberId: string) {
    return prisma.teamMember.delete({
      where: { id: memberId, userId },
    });
  }

  async getTeamMembers(userId: string) {
    return prisma.teamMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
