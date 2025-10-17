import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.create({
        data: {
          id: `user_${Date.now()}`,
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
          imageUrl: image_url || null,
        },
      });

      console.log(`✅ User created: ${id}`);
    } catch (error) {
      console.error('Error creating user:', error);
      // Don't fail the webhook if user already exists
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log('User already exists, skipping');
      } else {
        return new NextResponse('Error creating user', { status: 500 });
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || undefined,
          name: `${first_name || ''} ${last_name || ''}`.trim() || undefined,
          imageUrl: image_url || undefined,
        },
      });

      console.log(`✅ User updated: ${id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      return new NextResponse('Error updating user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`✅ User deleted: ${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      // Don't fail if user doesn't exist
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        console.log('User already deleted, skipping');
      } else {
        return new NextResponse('Error deleting user', { status: 500 });
      }
    }
  }

  return new NextResponse('Webhook processed', { status: 200 });
}
