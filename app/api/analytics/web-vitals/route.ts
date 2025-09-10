import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const webVitalSchema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  url: z.string().url(),
  userAgent: z.string(),
  timestamp: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const metric = webVitalSchema.parse(body);

    // Store web vital metric
    await prisma.webVital.create({
      data: {
        userId: userId || null,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        metricId: metric.id,
        url: metric.url,
        userAgent: metric.userAgent,
        timestamp: new Date(metric.timestamp),
        sessionId: request.headers.get('x-session-id') || null,
      },
    });

    // If performance is poor, log for immediate attention
    if (metric.rating === 'poor') {
      console.warn(`Poor performance detected: ${metric.name} = ${metric.value}ms on ${metric.url}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Web vitals tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track web vital' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    
    const timeframe = searchParams.get('timeframe') || '24h';
    const metric = searchParams.get('metric');

    let startDate: Date;
    switch (timeframe) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      timestamp: { gte: startDate },
    };

    if (metric) {
      whereClause.name = metric;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    const metrics = await prisma.webVital.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    // Calculate aggregates
    const aggregates = metrics.reduce((acc, m) => {
      if (!acc[m.name]) {
        acc[m.name] = {
          name: m.name,
          count: 0,
          total: 0,
          good: 0,
          needsImprovement: 0,
          poor: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      const agg = acc[m.name];
      agg.count++;
      agg.total += m.value;
      agg[m.rating === 'good' ? 'good' : m.rating === 'needs-improvement' ? 'needsImprovement' : 'poor']++;
      agg.min = Math.min(agg.min, m.value);
      agg.max = Math.max(agg.max, m.value);

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and percentages
    Object.values(aggregates).forEach((agg: any) => {
      agg.average = agg.total / agg.count;
      agg.goodPercentage = (agg.good / agg.count) * 100;
      agg.needsImprovementPercentage = (agg.needsImprovement / agg.count) * 100;
      agg.poorPercentage = (agg.poor / agg.count) * 100;
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        aggregates: Object.values(aggregates),
        timeframe,
        totalSamples: metrics.length,
      },
    });

  } catch (error) {
    console.error('Get web vitals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get web vitals' },
      { status: 500 }
    );
  }
}
