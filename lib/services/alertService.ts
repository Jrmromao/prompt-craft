import { prisma } from '@/lib/prisma';

export type AlertType = 'COST_SPIKE' | 'HIGH_ERROR_RATE' | 'USAGE_LIMIT' | 'SLOW_RESPONSE';

export class AlertService {
  private static instance: AlertService;

  static getInstance(): AlertService {
    if (!this.instance) {
      this.instance = new AlertService();
    }
    return this.instance;
  }

  async createAlert(userId: string, type: AlertType, threshold: number) {
    return prisma.alert.create({
      data: { userId, type, threshold, enabled: true },
    });
  }

  async checkAlerts(userId: string) {
    const alerts = await prisma.alert.findMany({
      where: { userId, enabled: true },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const runs = await prisma.promptRun.findMany({
      where: { userId, createdAt: { gte: startOfDay } },
    });

    const triggered = [];

    for (const alert of alerts) {
      let shouldTrigger = false;

      switch (alert.type) {
        case 'COST_SPIKE':
          const totalCost = runs.reduce((sum, r) => sum + r.cost, 0);
          shouldTrigger = totalCost > alert.threshold;
          break;

        case 'HIGH_ERROR_RATE':
          const errorRate = runs.filter(r => !r.success).length / runs.length;
          shouldTrigger = errorRate > alert.threshold / 100;
          break;

        case 'SLOW_RESPONSE':
          const avgLatency = runs.reduce((sum, r) => sum + r.latency, 0) / runs.length;
          shouldTrigger = avgLatency > alert.threshold;
          break;
      }

      if (shouldTrigger) {
        triggered.push(alert);
        await this.sendNotification(userId, alert);
      }
    }

    return triggered;
  }

  private async sendNotification(userId: string, alert: any) {
    // Store notification in DB
    await prisma.notification.create({
      data: {
        userId,
        type: alert.type,
        message: this.getAlertMessage(alert),
        read: false,
      },
    });

    // Send email via Resend
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'PromptCraft Alerts <alerts@promptcraft.app>',
          to: user.email,
          subject: `Alert: ${alert.type.replace('_', ' ')}`,
          html: `
            <h2>PromptCraft Alert</h2>
            <p>${this.getAlertMessage(alert)}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View Dashboard</a></p>
          `,
        });
      }
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  private getAlertMessage(alert: any): string {
    switch (alert.type) {
      case 'COST_SPIKE':
        return `Daily costs exceeded $${alert.threshold}`;
      case 'HIGH_ERROR_RATE':
        return `Error rate exceeded ${alert.threshold}%`;
      case 'SLOW_RESPONSE':
        return `Average latency exceeded ${alert.threshold}ms`;
      default:
        return 'Alert triggered';
    }
  }

  async getNotifications(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { read: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }
}
