import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QualityAwareRouter } from '@/lib/services/qualityAwareRouter';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestedModel, messages, qualityPreference } = await request.json();

    if (!requestedModel || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const decision = await QualityAwareRouter.route(
      requestedModel,
      messages,
      userId
    );

    return NextResponse.json({
      enabled: decision.qualityRisk !== 'high',
      decision,
      qualityGuarantee: decision.confidence > 0.8
    });
  } catch (error) {
    console.error('Quality routing error:', error);
    return NextResponse.json(
      { error: 'Routing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Return routing status - always enabled but with quality safeguards
    return NextResponse.json({
      enabled: true,
      qualityThreshold: 0.85,
      message: 'Quality-aware routing active with safeguards'
    });
  } catch (error) {
    return NextResponse.json({ enabled: false });
  }
}
