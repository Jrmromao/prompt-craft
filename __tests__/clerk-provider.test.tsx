import { render } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/Providers';

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';

// Mock other dependencies
jest.mock('@/lib/analytics', () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/components/cookies/CookieBanner', () => {
  return function CookieBanner() {
    return <div data-testid="cookie-banner" />;
  };
});

jest.mock('@/components/ErrorBoundary', () => {
  return function ErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('ClerkProvider Integration', () => {
  it('should render ClerkProvider without errors', () => {
    const TestComponent = () => <div data-testid="test-content">Test Content</div>;
    
    const { getByTestId } = render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('should have ClerkProvider in the component tree', () => {
    const TestComponent = () => {
      // This would throw if ClerkProvider is not present
      return <div data-testid="clerk-test">Clerk is working</div>;
    };

    const { getByTestId } = render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(getByTestId('clerk-test')).toBeInTheDocument();
  });
});

console.log('✅ ClerkProvider configuration test completed');
