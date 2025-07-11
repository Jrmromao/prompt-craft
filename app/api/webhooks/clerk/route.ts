import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import S3Service from '@/lib/services/S3Service';
import { EmailService } from '@/lib/services/emailService';
import Stripe from 'stripe';
import { PlanType } from '@/app/constants/plans';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants for security configurations
const MAX_PAYLOAD_SIZE = 1048576; // 1MB in bytes
const MAX_EXECUTION_TIME = 30000; // 30 seconds in milliseconds

// Rate limiting setup (simple in-memory implementation)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100;
const requestTimestamps: number[] = [];

// Email validation regex (basic validation - consider using a library in production)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper function to validate user ID format
function isValidUserId(userId: string): boolean {
  // Clerk user IDs are typically prefixed with 'user_' followed by alphanumeric characters
  return /^user_[a-zA-Z0-9]{10,}$/.test(userId);
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Helper function to sanitize string inputs
function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  // Basic sanitization - remove control characters and limit length
  return input
    .replace(/[^\x20-\x7E]/g, '') // Only allow printable ASCII characters
    .trim()
    .substring(0, 255);
}

// Helper function to create or update a user with proper error handling and input validation
async function createOrUpdateUser(
  clerkUserId: string,
  email: string,
  firstName: string | null,
  lastName: string | null
): Promise<boolean> {
  
  console.log("clerkUserId", clerkUserId);
  console.log("email", email);
  console.log("firstName", firstName);
  console.log("lastName", lastName);
  
  // Validate inputs
  if (!isValidUserId(clerkUserId)) {
    console.error(`Invalid Clerk user ID format: ${clerkUserId}`);
    return false;
  }

  if (!isValidEmail(email)) {
    console.error(`Invalid email format: ${email}`);
    return false;
  }

  // Sanitize name inputs
  const sanitizedFirstName = sanitizeString(firstName);
  const sanitizedLastName = sanitizeString(lastName);

  // Construct full name safely
  const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim() || 'User';

  try {
    // Create Stripe customer first
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    });

    const customer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        clerkId: clerkUserId,
      },
    });

    // Create or update user with Stripe customer ID
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        email,
        name: fullName,
        updatedAt: new Date(),
        stripeCustomerId: customer.id,
      },
      create: {
        clerkId: clerkUserId,
        email,
        name: fullName,
        stripeCustomerId: customer.id,
        planType: PlanType.FREE, 
        monthlyCredits: 10,
        purchasedCredits: 0,
        creditCap: 10,
        lastCreditReset: new Date(),
      },
    });

    // Set the database ID in Clerk's private metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      privateMetadata: {
        databaseId: user.id,
        planType: user.planType,
      }
    });

    console.log(`User upserted for clerk ID: ${clerkUserId.substring(0, 8)}...`);
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Database error processing user: ${error.code}`);
    } else {
      console.error(
        'Error in user operation:',
        typeof error === 'object' ? (error as Error).message : 'Unknown error'
      );
    }
    return false;
  }
}

// Helper function to check rate limit
function checkRateLimit(): { isLimited: boolean; remainingTime: number } {
  const now = Date.now();
  requestTimestamps.push(now);
  
  // Remove timestamps outside the current window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }

  const isLimited = requestTimestamps.length > MAX_REQUESTS_PER_WINDOW;
  const remainingTime = isLimited ? RATE_LIMIT_WINDOW - (now - requestTimestamps[0]) : 0;

  return { isLimited, remainingTime };
}

export async function POST(req: Request) {
  // Check rate limit
  const { isLimited, remainingTime } = checkRateLimit();
  if (isLimited) {
    console.warn(`Rate limit exceeded for Clerk webhook. Retry after ${remainingTime}ms`);
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(remainingTime / 1000) },
      { status: 429, headers: { 'Retry-After': Math.ceil(remainingTime / 1000).toString() } }
    );
  }

  // Set a timeout to prevent long-running operations
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), MAX_EXECUTION_TIME)
  );

  try {
    // Process the webhook with a timeout
    const responsePromise = processWebhook(req);
    return (await Promise.race([responsePromise, timeoutPromise])) as NextResponse;
  } catch (error) {
    console.error(
      'Error in webhook handler:',
      typeof error === 'object' ? (error as Error).message : 'Unknown error'
    );
    // Return generic error for security
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processWebhook(req: Request): Promise<NextResponse> {
  try {
    // Verify webhook signatures securely
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');

    // If there are no svix headers, return 400
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check payload size before parsing to prevent DoS attacks
    const contentLengthHeader = req.headers.get('content-length');
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

    if (contentLength > MAX_PAYLOAD_SIZE) {
      console.error(`Payload too large: ${contentLength} bytes`);
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Missing webhook secret configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Handle the webhook event
    const eventType = evt.type;

    // Process based on event type
    switch (eventType) {
      case 'session.created': {
        // Extract user data from the session
        const { user_id } = evt.data;
        if (!user_id || !isValidUserId(user_id)) {
          console.error('Invalid user ID in session data');
          return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: user_id },
          select: { id: true }, // Only select the ID for security
        });

        // If user doesn't exist, we need to create them (social login case)
        if (!existingUser) {
          try {
            if (!clerkClient) {
              throw new Error('Clerk client not initialized');
            }

            // Fetch the user details from Clerk
            const clerkUser = await (clerkClient as any).users.getUser(user_id);

            if (!clerkUser) {
              console.error('Failed to fetch user data from Clerk');
              return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
            }

            const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

            if (!primaryEmail || !isValidEmail(primaryEmail)) {
              console.error('Invalid or missing email address');
              return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
            }

            const success = await createOrUpdateUser(
              user_id,
              primaryEmail,
              clerkUser.firstName,
              clerkUser.lastName
            );

            if (!success) {
              return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
            }

            // Add security alert email if user has security alerts enabled
            const user = await prisma.user.findUnique({
              where: { clerkId: user_id },
              select: {
                email: true,
                name: true,
                emailPreferences: true,
              },
            });

            if (user) {
              const emailPreferences =
                typeof user.emailPreferences === 'string'
                  ? JSON.parse(user.emailPreferences)
                  : user.emailPreferences;

              if (emailPreferences?.securityAlerts) {
                const emailService = EmailService.getInstance();
                await emailService.sendSecurityAlert(
                  user.email,
                  user.name || 'there',
                  'Unknown Location',
                  'Unknown Device'
                );
              }
            }

            return NextResponse.json({ success: true });
          } catch (error) {
            console.error(
              'User creation error:',
              error instanceof Error ? error.message : 'Unknown error'
            );
            return NextResponse.json({ error: 'Authentication processing error' }, { status: 500 });
          }
        }
        break;
      }

      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;

        if (!id || !isValidUserId(id)) {
          console.error('Invalid user ID in webhook data');
          return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail || !isValidEmail(primaryEmail)) {
          console.error('Invalid or missing email address');
          return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
        }

        try {
          // Set default publicMetadata.role to 'USER' in Clerk
        
          // const clerk = await clerkClient();
          // await clerk.users.updateUser(id, {
          //   publicMetadata: { role: 'USER' },
            // });

          const client = await clerkClient();
          await client.users.updateUser(id, {
            publicMetadata: { role: 'USER' },
          });
       
          // Create user in database
          await createOrUpdateUser(id, primaryEmail, first_name, last_name);

          // TODO: Uncomment this when we have a welcome email
          // Send welcome email
          // const emailService = EmailService.getInstance();
          // await emailService.sendWelcomeEmail(primaryEmail, first_name || 'there');

          return NextResponse.json({ success: true });
        } catch (error) {
          console.error(
            'User creation error:',
            error instanceof Error ? error.message : 'Unknown error'
          );
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = evt.data;

        if (!id || !isValidUserId(id)) {
          console.error('Invalid user ID in webhook data');
          return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail || !isValidEmail(primaryEmail)) {
          console.error('Invalid or missing email address');
          return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
        }

        await createOrUpdateUser(id, primaryEmail, first_name, last_name);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        if (!id || !isValidUserId(id)) {
          console.error('Invalid user ID in webhook data');
          return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        try {
          // Use transaction for safety
          await prisma.$transaction(async tx => {
            await tx.user.deleteMany({
              where: { clerkId: id },
            });
          });
        } catch (error) {
          console.error(
            'User deletion error:',
            error instanceof Error ? error.message : 'Unknown error'
          );
          return NextResponse.json({ error: 'User deletion failed' }, { status: 500 });
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
