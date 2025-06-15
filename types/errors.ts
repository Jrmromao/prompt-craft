export interface BaseError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface ApiError extends BaseError {
  type: 'API_ERROR';
  status: number;
}

export interface ServiceError extends BaseError {
  type: 'SERVICE_ERROR';
  service: string;
}

export interface ValidationError extends BaseError {
  type: 'VALIDATION_ERROR';
  field?: string;
}

export interface AuthError extends BaseError {
  type: 'AUTH_ERROR';
  reason?: string;
}

export type AppError = ApiError | ServiceError | ValidationError | AuthError;

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === 'API_ERROR';
}

export function isServiceError(error: unknown): error is ServiceError {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === 'SERVICE_ERROR';
}

export function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === 'VALIDATION_ERROR';
}

export function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === 'AUTH_ERROR';
}

export function isAppError(error: unknown): error is AppError {
  return (
    isApiError(error) ||
    isServiceError(error) ||
    isValidationError(error) ||
    isAuthError(error)
  );
} 