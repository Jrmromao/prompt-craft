import { GDPRService } from '@/lib/services/gdpr';

export async function enforceDataRetention() {
  console.log('Starting data retention enforcement...');
  
  try {
    const gdprService = new GDPRService();
    await gdprService.checkAndEnforceRetention();
    console.log('Data retention enforcement completed');
  } catch (error) {
    console.error('Error enforcing data retention:', error);
    throw error;
  }
} 