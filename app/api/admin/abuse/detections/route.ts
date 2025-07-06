import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { VoteAbuseType, VoteAbuseSeverity, VoteAbuseStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') as VoteAbuseStatus | null;
    const severity = searchParams.get('severity') as VoteAbuseSeverity | null;
    const type = searchParams.get('type') as VoteAbuseType | null;
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.abuseType = type;
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { userId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [detections, total] = await Promise.all([
      prisma.voteAbuseDetection.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          investigator: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { detectedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.voteAbuseDetection.count({ where })
    ]);

    const formattedDetections = detections.map(detection => ({
      id: detection.id,
      userId: detection.userId,
      userName: detection.user?.name,
      userEmail: detection.user?.email,
      abuseType: detection.abuseType,
      severity: detection.severity,
      status: detection.status,
      detectedAt: detection.detectedAt,
      resolvedAt: detection.resolvedAt,
      investigatedBy: detection.investigator?.name,
      resolution: detection.resolution,
      details: detection.details
    }));

    return NextResponse.json({
      detections: formattedDetections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching abuse detections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 