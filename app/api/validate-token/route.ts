import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex');
    
    // Look up the token in the database
    const apiKey = await prisma.apiKey.findUnique({
      where: { 
        hashedKey: hashedToken,
      },
      include: {
        User: true
      }
    });

    if (!apiKey) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Check if token is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastRotatedAt: new Date() }
    });

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
