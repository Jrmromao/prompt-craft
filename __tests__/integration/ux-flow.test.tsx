import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { BottomTabNavigation } from '@/components/mobile/BottomTabNavigation';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = require('next/navigation').usePathname as jest.MockedFunction<any>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('UX Flow Integration', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    
    mockUsePathname.mockReturnValue('/dashboard');
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockClear();
    mockPush.mockClear();
  });

  describe('Mobile Navigation Flow', () => {
    it('renders bottom navigation with proper touch targets', () => {
      render(<BottomTabNavigation />);
      
      const tabs = screen.getAllByRole('link');
      expect(tabs).toHaveLength(4);
      
      tabs.forEach(tab => {
        expect(tab).toHaveClass('min-h-[60px]', 'min-w-[60px]', 'touch-manipulation');
      });
    });

    it('highlights active tab correctly', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<BottomTabNavigation />);
      
      const homeTab = screen.getByText('Home').closest('a');
      expect(homeTab).toHaveClass('text-purple-600');
    });

    it('navigates to correct routes', () => {
      render(<BottomTabNavigation />);
      
      const createTab = screen.getByText('Create');
      expect(createTab.closest('a')).toHaveAttribute('href', '/prompts/create');
    });
  });

  describe('Search Flow', () => {
    it('performs search and displays results', async () => {
      const mockResults = {
        success: true,
        data: {
          prompts: [{
            id: 'prompt-1',
            type: 'prompt' as const,
            title: 'Test Prompt',
            description: 'Test description',
            relevance: 100,
            createdAt: '2024-01-01',
            _count: { likes: 5, uses: 10 },
          }],
          users: [],
          total: 1,
        },
        query: 'test',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResults),
      } as Response);

      render(<GlobalSearch />);
      
      const input = screen.getByPlaceholderText('Search prompts, templates, community...');
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
        expect(screen.getByText('5 likes • 10 uses')).toBeInTheDocument();
      });
    });

    it('saves and displays recent searches', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['previous search']));
      
      render(<GlobalSearch />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(screen.getByText('Recent searches')).toBeInTheDocument();
      expect(screen.getByText('previous search')).toBeInTheDocument();
    });
  });

  describe('Onboarding Flow', () => {
    const newUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    };

    it('completes full onboarding flow', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      } as Response);

      render(<WelcomeModal user={newUser} />);
      
      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Welcome to PromptCraft, John!')).toBeInTheDocument();
      });

      // Complete first step
      const createButton = screen.getByText('Create Prompt');
      fireEvent.click(createButton);

      expect(mockFetch).toHaveBeenCalledWith('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'create',
          completed: true,
        }),
      });

      expect(mockPush).toHaveBeenCalledWith('/prompts/create?welcome=true');
    });

    it('tracks progress through multiple steps', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      } as Response);

      render(<WelcomeModal user={newUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Your First Prompt')).toBeInTheDocument();
      });

      // Navigate to second step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      expect(screen.getByText('Explore Community')).toBeInTheDocument();

      // Complete second step
      const browseButton = screen.getByText('Browse Prompts');
      fireEvent.click(browseButton);

      expect(mockFetch).toHaveBeenCalledWith('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'explore',
          completed: true,
        }),
      });

      expect(mockPush).toHaveBeenCalledWith('/community');
    });
  });

  describe('Performance Monitoring', () => {
    it('tracks web vitals in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock performance API
      const mockMark = jest.fn();
      const mockMeasure = jest.fn();
      const mockGetEntriesByName = jest.fn().mockReturnValue([{ duration: 1500 }]);

      Object.defineProperty(window, 'performance', {
        value: {
          mark: mockMark,
          measure: mockMeasure,
          getEntriesByName: mockGetEntriesByName,
        },
      });

      const { PerformanceMonitor } = require('@/components/performance/PerformanceMonitor');
      render(<PerformanceMonitor />);

      expect(mockMark).toHaveBeenCalledWith('app-start');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('handles search API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      
      render(<GlobalSearch />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      // Should not crash and should clear loading state
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('handles onboarding API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      
      const newUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      };

      render(<WelcomeModal user={newUser} />);
      
      await waitFor(() => {
        const createButton = screen.getByText('Create Prompt');
        fireEvent.click(createButton);
      });

      // Should still navigate even if tracking fails
      expect(mockPush).toHaveBeenCalledWith('/prompts/create?welcome=true');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<BottomTabNavigation />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('supports keyboard navigation', () => {
      render(<GlobalSearch />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder');
      
      // Input should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });
});
