export class StripeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeServiceError';
  }
}

export class StripeCustomerError extends StripeServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StripeCustomerError';
  }
}

export class StripeSubscriptionError extends StripeServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StripeSubscriptionError';
  }
}

export class StripeCheckoutError extends StripeServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StripeCheckoutError';
  }
}

export class StripeWebhookError extends StripeServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StripeWebhookError';
  }
}

export class StripePaymentError extends StripeServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'StripePaymentError';
  }
}

export function isStripeError(error: any): error is StripeServiceError {
  return error instanceof StripeServiceError;
}

export function handleStripeError(error: any): StripeServiceError {
  if (error instanceof StripeServiceError) {
    return error;
  }

  // Handle Stripe API errors
  if (error.type && error.code) {
    switch (error.type) {
      case 'StripeCardError':
        return new StripePaymentError(`Card error: ${error.message}`);
      case 'StripeInvalidRequestError':
        return new StripeServiceError(`Invalid request: ${error.message}`);
      case 'StripeAPIError':
        return new StripeServiceError(`API error: ${error.message}`);
      case 'StripeConnectionError':
        return new StripeServiceError(`Connection error: ${error.message}`);
      case 'StripeAuthenticationError':
        return new StripeServiceError(`Authentication error: ${error.message}`);
      case 'StripePermissionError':
        return new StripeServiceError(`Permission error: ${error.message}`);
      case 'StripeRateLimitError':
        return new StripeServiceError(`Rate limit error: ${error.message}`);
      case 'StripeValidationError':
        return new StripeServiceError(`Validation error: ${error.message}`);
      default:
        return new StripeServiceError(`Unknown Stripe error: ${error.message}`);
    }
  }

  // Handle unknown errors
  return new StripeServiceError(`Unknown error: ${error.message || 'An unknown error occurred'}`);
} 