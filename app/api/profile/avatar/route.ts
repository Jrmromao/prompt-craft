import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return new NextResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed.', { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse('File size too large. Maximum size is 5MB.', { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const filename = `${uuidv4()}.webp`;

    // Process image with sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Save to public directory
    const publicDir = join(process.cwd(), 'public', 'avatars');
    await writeFile(join(publicDir, filename), processedImageBuffer);

    // Update user profile with new avatar URL
    const avatarUrl = `/avatars/${filename}`;
    await prisma.user.update({
      where: { clerkId: userId },
      data: { imageUrl: avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 