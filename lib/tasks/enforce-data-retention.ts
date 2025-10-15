import { GDPRService } from '@/lib/services/gdpr';

export async function enforceDataRetention() {
  
  try {
    const gdprService = new GDPRService();
    await gdprService.checkAndEnforceRetention();
  } catch (error) {
    console.error('Error enforcing data retention:', error);
    throw error;
  }
} 