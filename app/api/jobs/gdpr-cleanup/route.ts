import { NextRequest, NextResponse } from 'next/server';
import { runGDPRCleanup } from '@/lib/jobs/gdpr-cleanup';

export async function POST(req: NextRequest) {
  try {
    // Verify cron job authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await runGDPRCleanup();

    return NextResponse.json({
      success: true,
      data: {
        message: 'GDPR cleanup job completed successfully',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GDPR cleanup job failed:', error);
    return NextResponse.json(
      { success: false, error: 'GDPR cleanup job failed' },
      { status: 500 }
    );
  }
}
