import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError, AppError, isAppError } from '@/types/errors';

// Base response type
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: ApiError;
};

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<ApiResponse<T>>;

export function createApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  schema?: z.ZodType<T>
): ApiHandler<T> {
  return async (req: NextRequest, context?: { params: Record<string, string> }) => {
    try {
      let data: T | undefined;

      if (schema) {
        const body = await req.json();
        data = schema.parse(body);
      }

      return await handler(req, context);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            type: 'API_ERROR',
            message: 'Validation error',
            status: 400,
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        };
      }

      if (isAppError(error)) {
        return {
          error: {
            type: 'API_ERROR',
            message: error.message,
            status: error.statusCode || 500,
            code: error.code,
          },
        };
      }

      return {
        error: {
          type: 'API_ERROR',
          message: 'Internal server error',
          status: 500,
        },
      };
    }
  };
}

// Base handler configuration
export type BaseHandlerConfig = {
  requireAuth?: boolean;
  schema?: z.ZodSchema;
  methods?: string[];
};

// Base handler class
export class BaseApiHandler {
  protected config: BaseHandlerConfig;

  constructor(config: BaseHandlerConfig = {}) {
    this.config = {
      requireAuth: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      ...config,
    };
  }

  // Main handler method
  public async handle(req: NextRequest): Promise<NextResponse> {
    try {
      // 1. Method validation
      if (!this.config.methods?.includes(req.method)) {
        return this.errorResponse('Method not allowed', 405);
      }

      // 2. Authentication check
      if (this.config.requireAuth) {
        const authResult = await this.checkAuth(req);
        if (!authResult.success) {
          return this.errorResponse(authResult.error || 'Unauthorized', 401);
        }
      }

      // 3. Input validation
      if (this.config.schema) {
        const validationResult = await this.validateInput(req);
        if (!validationResult.success) {
          return this.errorResponse(validationResult.error || 'Invalid request data', 400);
        }
      }

      // 4. Process request
      const result = await this.process(req);
      return this.successResponse(result);
    } catch (error) {
      console.error('API Error:', error);
      return this.handleError(error);
    }
  }

  // Protected methods to be implemented by child classes
  protected async process(req: NextRequest): Promise<any> {
    throw new Error('process() method must be implemented');
  }

  // Utility methods
  protected async checkAuth(req: NextRequest): Promise<{ success: boolean; error?: string }> {
    // Implement your auth check logic here
    // This is a placeholder - implement based on your auth system
    return { success: true };
  }

  protected async validateInput(req: NextRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const body = await req.json();
      await this.config.schema?.parseAsync(body);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map(e => e.message).join(', '),
        };
      }
      return { success: false, error: 'Invalid request data' };
    }
  }

  protected successResponse(data: any): NextResponse {
    return NextResponse.json({ data });
  }

  protected errorResponse(message: string, status: number, code?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          message,
          status,
          code,
        },
      },
      { status }
    );
  }

  protected handleError(error: unknown): NextResponse {
    if (error instanceof Error) {
      return this.errorResponse(error.message, 500, 'INTERNAL_ERROR');
    }
    return this.errorResponse('Internal Server Error', 500);
  }
}
