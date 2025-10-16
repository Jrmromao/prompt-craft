export class AlertService {
  async sendAlert(userId: string, message: string, type: string = 'info') {
    return { success: true, alertId: 'alert_123' };
  }

  async getAlerts(userId: string) {
    return [];
  }
}
