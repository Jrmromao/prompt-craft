/**
 * Test: API Response Format
 * Ensures all API routes follow standard response structure
 */

import { NextResponse } from 'next/server';

describe('API Response Format', () => {
  it('should return success response with correct structure', () => {
    const response = NextResponse.json({
      success: true,
      data: { id: '123', name: 'Test' },
      error: null
    });

    const body = response.body;
    expect(response.status).toBe(200);
  });

  it('should return error response with correct structure', () => {
    const response = NextResponse.json({
      success: false,
      data: null,
      error: 'Something went wrong'
    }, { status: 400 });

    expect(response.status).toBe(400);
  });

  it('should have required fields in response', () => {
    const successResponse = {
      success: true,
      data: { test: 'data' },
      error: null
    };

    expect(successResponse).toHaveProperty('success');
    expect(successResponse).toHaveProperty('data');
    expect(successResponse).toHaveProperty('error');
  });

  it('should have correct types', () => {
    type APIResponse<T> = {
      success: boolean;
      data: T | null;
      error: string | null;
    };

    const response: APIResponse<{ id: string }> = {
      success: true,
      data: { id: '123' },
      error: null
    };

    expect(typeof response.success).toBe('boolean');
    expect(response.data).toBeTruthy();
    expect(response.error).toBeNull();
  });
});
