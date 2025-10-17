// Edge-compatible token validation using environment variables
// This avoids importing heavy dependencies like Prisma in Edge Functions

interface TokenCache {
  [key: string]: {
    valid: boolean;
    expiresAt?: number;
    lastChecked: number;
  };
}

// Simple in-memory cache for Edge Functions
// In production, this could be replaced with Redis or another edge-compatible store
const tokenCache: TokenCache = {};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

export async function validateApiTokenEdge(token: string): Promise<boolean> {
  try {
    // Basic format validation first
    if (!token || token.length < 32) {
      return false;
    }
    
    // Basic token format validation
    const tokenRegex = /^[a-f0-9]{32,}$/i;
    if (!tokenRegex.test(token)) {
      return false;
    }

    // Check cache first
    const now = Date.now();
    const cached = tokenCache[token];
    
    if (cached && (now - cached.lastChecked) < CACHE_TTL) {
      return cached.valid;
    }

    // For Edge Functions, we'll do a basic validation
    // In production, you might want to call an external API or use a different approach
    const isValid = await validateTokenWithExternalService(token);
    
    // Cache the result
    if (Object.keys(tokenCache).length >= MAX_CACHE_SIZE) {
      // Clear oldest entries
      const entries = Object.entries(tokenCache);
      entries.sort((a, b) => a[1].lastChecked - b[1].lastChecked);
      const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
      toDelete.forEach(([key]) => delete tokenCache[key]);
    }
    
    tokenCache[token] = {
      valid: isValid,
      lastChecked: now,
    };

    return isValid;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

async function validateTokenWithExternalService(token: string): Promise<boolean> {
  try {
    // For Edge Functions, we need to call the validation API
    // This is the most secure approach that works with the database
    let baseUrl = process.env.NEXTAUTH_URL;
    
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }
    
    const response = await fetch(`${baseUrl}/api/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error('Token validation API error:', response.status);
      return false;
    }

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('External token validation error:', error);
    return false;
  }
}

// Helper function to clear cache (useful for testing)
export function clearTokenCache(): void {
  Object.keys(tokenCache).forEach(key => delete tokenCache[key]);
}
