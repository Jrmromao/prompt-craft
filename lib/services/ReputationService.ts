import { prisma } from '@/lib/prisma';

interface ReputationScore {
  userId: string;
  score: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  violations: number;
}

export class ReputationService {
  private static instance: ReputationService;

  static getInstance(): ReputationService {
    if (!ReputationService.instance) {
      ReputationService.instance = new ReputationService();
    }
    return ReputationService.instance;
  }

  async calculateScore(userId: string): Promise<ReputationScore> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        prompts: { include: { _count: { select: { likes: true, views: true } } } },
        _count: { select: { prompts: true } }
      }
    });

    if (!user) throw new Error('User not found');

    let score = 0;
    
    // Base points for prompts created
    score += user._count.prompts * 10;
    
    // Points for engagement
    user.prompts.forEach(prompt => {
      score += prompt._count.likes * 2;
      score += Math.floor(prompt._count.views / 10);
    });

    // Penalties for violations
    const violations = await this.getViolationCount(userId);
    score -= violations * 50;

    const level = this.getLevel(score);

    return { userId, score: Math.max(0, score), level, violations };
  }

  private async getViolationCount(userId: string): Promise<number> {
    try {
      return await prisma.voteAbuseDetection.count({
        where: { userId, status: 'CONFIRMED' }
      });
    } catch (error) {
      // If table doesn't exist or other error, return 0
      return 0;
    }
  }

  private getLevel(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (score >= 1000) return 'platinum';
    if (score >= 500) return 'gold';
    if (score >= 100) return 'silver';
    return 'bronze';
  }

  async updateReputation(userId: string): Promise<ReputationScore> {
    const reputation = await this.calculateScore(userId);
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        reputation: reputation.score
      }
    });

    return reputation;
  }
}
