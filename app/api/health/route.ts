import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check environment variables
    const requiredEnvs = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY'
    ];
    
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      return NextResponse.json(
        { status: 'error', message: `Missing env vars: ${missingEnvs.join(', ')}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed' },
      { status: 500 }
    );
  }
}
