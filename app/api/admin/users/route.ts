import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminUserService } from '@/lib/services/AdminUserService';
import { z } from 'zod';

const userQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';

    const adminUserService = AdminUserService.getInstance();
    const users = await adminUserService.getUsers({ search, role });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total: users.length,
        pages: Math.ceil(users.length / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
