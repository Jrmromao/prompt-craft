import * as Sentry from '@sentry/nextjs';

export type UserFlow = 
  | 'signup'
  | 'login'
  | 'profile_update'
  | 'profile_delete'
  | 'subscription_change'
  | 'payment_processing'
  | 'version_conversion'
  | 'admin_metrics';

export const trackUserFlowError = (
  flow: UserFlow,
  error: Error,
  context: Record<string, any> = {}
) => {
  Sentry.withScope((scope) => {
    // Set the user flow as a tag
    scope.setTag('user_flow', flow);
    
    // Add context data
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });

    // Capture the error
    Sentry.captureException(error);
  });
};

export const trackUserFlowEvent = (
  flow: UserFlow,
  event: string,
  data: Record<string, any> = {}
) => {
  Sentry.addBreadcrumb({
    category: 'user_flow',
    message: event,
    level: 'info',
    data: {
      flow,
      ...data,
    },
  });
}; 