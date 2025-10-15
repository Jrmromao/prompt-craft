import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const healthy = checks.database && checks.redis;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
