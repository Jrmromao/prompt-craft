import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Helper function to validate user ID format
export function isValidUserId(userId: string): boolean {
  return /^user_[a-zA-Z0-9]{10,}$/.test(userId);
}

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_REGEX.test(email);
}

// Helper function to sanitize string inputs
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  const CONTROL_CHARS = Array.from({ length: 32 }, (_, i) => String.fromCharCode(i))
    .concat(Array.from({ length: 33 }, (_, i) => String.fromCharCode(i + 127)))
    .join('');
  const CONTROL_CHARS_REGEX = new RegExp(`[${CONTROL_CHARS}]`, 'g');

  return input.replace(CONTROL_CHARS_REGEX, '').trim().substring(0, 255);
}

// Helper function to create or update a user
export async function createOrUpdateUser(
  clerkUserId: string,
  email: string,
  firstName: string | null,
  lastName: string | null
): Promise<boolean> {
  if (!isValidUserId(clerkUserId)) {
    console.error(`Invalid Clerk user ID format: ${clerkUserId}`);
    return false;
  }

  if (!isValidEmail(email)) {
    console.error(`Invalid email format: ${email}`);
    return false;
  }

  const sanitizedFirstName = sanitizeString(firstName);
  const sanitizedLastName = sanitizeString(lastName);

  const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim() || 'User';
  try {
    await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email,
        name: fullName,
      },
    });

    console.log(`User operation successful for clerk ID: ${clerkUserId.substring(0, 8)}...`);
    return true;
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error(`Database error processing user: ${error.code}`);
    } else {
      console.error(
        'Error in user operation:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    return false;
  }
}
