/**
 * Authentication helper utilities to prevent common Clerk errors
 */

export const AUTH_ERRORS = {
  ALREADY_SIGNED_IN: 'You\'re already signed in',
  AUTHENTICATION_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
} as const;

/**
 * Safely handles OAuth authentication with proper error handling
 */
export function createSafeOAuthHandler(
  authMethod: any,
  isSignedIn: boolean | undefined,
  isLoaded: boolean | undefined,
  router: any,
  setError: (error: string) => void,
  redirectUrl: string = '/prompts'
) {
  return async (provider: 'oauth_google' | 'oauth_github') => {
    // Early returns for invalid states
    if (!authMethod || !isLoaded) {
      console.warn('Auth method not loaded yet');
      return;
    }
    
    // Multiple checks for signed-in state to prevent OAuth calls
    if (isSignedIn === true) {
      console.log('User already signed in, redirecting immediately...');
      router.push(redirectUrl);
      return;
    }
    
    // Additional check: if isSignedIn is undefined but we're on an auth page, 
    // the middleware should have already redirected us
    if (isSignedIn === undefined && isLoaded) {
      console.log('Auth state unclear, redirecting to be safe...');
      router.push(redirectUrl);
      return;
    }
    
    // Final check before OAuth call
    if (isSignedIn) {
      console.log('Final check: User signed in, aborting OAuth');
      router.push(redirectUrl);
      return;
    }
    
    try {
      console.log('Initiating OAuth with', provider);
      await authMethod.authenticateWithPopup({
        strategy: provider,
        redirectUrl: redirectUrl,
      });
    } catch (error: any) {
      console.error('OAuth authentication error:', error);
      
      // Handle specific Clerk errors
      if (error?.message?.includes(AUTH_ERRORS.ALREADY_SIGNED_IN) || 
          error?.message?.includes('already signed in') ||
          error?.message?.includes('You\'re already signed in')) {
        console.log('OAuth error indicates user already signed in, redirecting...');
        router.push(redirectUrl);
        return;
      }
      
      setError(error?.message || AUTH_ERRORS.AUTHENTICATION_FAILED);
    }
  };
}

/**
 * Creates a safe redirect effect with proper cleanup
 */
export function createSafeRedirectEffect(
  isSignedIn: boolean | undefined,
  authLoaded: boolean | undefined,
  router: any,
  redirectUrl: string = '/prompts',
  delay: number = 100
) {
  return () => {
    if (authLoaded && isSignedIn) {
      // Prevent infinite loops by checking if we're already on the target page
      if (redirectUrl === '/sign-in' || redirectUrl === '/sign-up') {
        router.push('/prompts');
        return;
      }
      
      const timer = setTimeout(() => {
        router.push(redirectUrl);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  };
}

/**
 * Validates authentication state before performing auth operations
 */
export function validateAuthState(
  isSignedIn: boolean | undefined,
  authLoaded: boolean | undefined,
  authMethod: any
): { canProceed: boolean; error?: string } {
  if (!authLoaded) {
    return { canProceed: false, error: 'Authentication not loaded' };
  }
  
  if (isSignedIn) {
    return { canProceed: false, error: 'User already signed in' };
  }
  
  if (!authMethod) {
    return { canProceed: false, error: 'Authentication method not available' };
  }
  
  return { canProceed: true };
}

/**
 * Safely redirects users to prevent infinite loops
 */
export function getSafeRedirectUrl(redirectUrl: string | null, fallback: string = '/prompts'): string {
  if (!redirectUrl) return fallback;
  
  // Prevent infinite loops by blocking auth pages
  if (redirectUrl === '/sign-in' || redirectUrl === '/sign-up') {
    return fallback;
  }
  
  // Ensure the URL is valid and starts with /
  if (!redirectUrl.startsWith('/')) {
    return fallback;
  }
  
  return redirectUrl;
}
