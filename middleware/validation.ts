import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Common validation schemas
const commonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  url: z.string().url(),
};

// API route specific schemas
const apiSchemas = {
  '/api/prompts': z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10).max(10000),
    tags: z.array(z.string()).max(10),
  }),
  '/api/community': z.object({
    message: z.string().min(1).max(1000),
    type: z.enum(['comment', 'reply']),
  }),
};

export function validationMiddleware(request: NextRequest) {
  // Only validate POST, PUT, PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return null;
  }

  const path = request.nextUrl.pathname;
  const schema = apiSchemas[path as keyof typeof apiSchemas];

  if (!schema) {
    return null;
  }

  try {
    // Parse and validate request body
    const body = request.json();
    schema.parse(body);

    // Sanitize the data
    const sanitizedBody = sanitizeData(body);
    
    // Add sanitized data to request for downstream handlers
    request.headers.set('x-sanitized-body', JSON.stringify(sanitizedBody));
    
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: error.errors,
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new NextResponse(JSON.stringify({
      error: 'Invalid Request',
      message: 'The request body is invalid',
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Remove any HTML tags
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/<[^>]*>/g, '');
    } else {
      sanitized[key] = sanitizeData(value);
    }
  }

  return sanitized;
} 