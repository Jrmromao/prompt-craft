export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export interface ServiceResponse<T> {
  data?: T;
  error?: ServiceError;
  success: boolean;
} 