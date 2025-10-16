import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/emailService';

export async function POST(req: Request) {
  try {
    const { apiKey, type, data } = await req.json();

    // Verify this is a valid request (check API key hash)
    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        hashedKey: apiKey,
      },
      include: {
        User: true,
      },
    });

    if (!keyRecord) {
      return new NextResponse('Invalid API key', { status: 401 });
    }

    // Get user's alert settings
    const alertSettings = await prisma.alertSettings.findUnique({
      where: { userId: keyRecord.userId },
    });

    const settings = alertSettings?.settings as any || {
      invalidApiKey: { enabled: true },
      costSpike: { enabled: false },
      errorRate: { enabled: false },
    };

    // Send appropriate alert
    switch (type) {
      case 'invalid_api_key':
        if (settings.invalidApiKey?.enabled) {
          await EmailService.sendInvalidApiKeyAlert(
            keyRecord.User.email,
            data.keyName || 'Unknown'
          );
        }
        break;

      case 'cost_spike':
        if (settings.costSpike?.enabled) {
          await EmailService.sendCostSpikeAlert(
            keyRecord.User.email,
            data.currentCost,
            settings.costSpike.threshold
          );
        }
        break;

      case 'error_rate':
        if (settings.errorRate?.enabled) {
          await EmailService.sendErrorRateAlert(
            keyRecord.User.email,
            data.errorRate,
            settings.errorRate.threshold
          );
        }
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering alert:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
