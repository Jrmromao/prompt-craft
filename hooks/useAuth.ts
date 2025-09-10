import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
  role: string;
  planType: string;
  createdAt: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // New API format: {success: true, data: {isAuthenticated: true, user: {...}}}
          const { isAuthenticated, user } = data.data;
          
          // Transform user data to match expected format
          const transformedUser = user ? {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.name?.split(' ')[0] || null,
            lastName: user.name?.split(' ').slice(1).join(' ') || null,
            username: user.name,
            imageUrl: null,
            role: user.role,
            planType: user.planType,
            createdAt: user.createdAt,
          } : null;

          setAuthState({
            isAuthenticated,
            user: transformedUser,
            isLoading: false,
            error: null,
          });
        } else {
          // API returned success: false
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: data.error || 'Authentication failed',
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Authentication check failed',
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Network error during authentication check',
      });
    }
  };

  const refreshAuth = () => {
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...authState,
    refreshAuth,
  };
}
