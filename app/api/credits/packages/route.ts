import { NextResponse } from 'next/server';
import { CreditPackageService } from '@/lib/services/creditPackageService';

export async function GET() {
  try {
    const packages = await CreditPackageService.getActivePackages();
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit packages' },
      { status: 500 }
    );
  }
} 