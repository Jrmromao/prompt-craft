import '@testing-library/jest-dom';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: jest.fn(),
    theme: 'system',
  }),
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key, fetcher) => {
    const [data, setData] = React.useState<any>(null);
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await fetcher(key);
          setData(result);
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [key]);

    return {
      data,
      error,
      isLoading,
      mutate: jest.fn(),
    };
  }),
}));
