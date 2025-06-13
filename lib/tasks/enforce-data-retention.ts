import { GDPRService } from '@/lib/services/gdpr';

const gdprService = new GDPRService();

export async function enforceDataRetention() {
  try {
    console.log('Starting data retention enforcement...');
    await gdprService.checkAndEnforceRetention();
    console.log('Data retention enforcement completed');
  } catch (error) {
    console.error('Error enforcing data retention:', error);
    throw error;
  }
} 