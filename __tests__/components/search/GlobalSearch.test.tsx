import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { GlobalSearch } from '@/components/search/GlobalSearch';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

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

describe('GlobalSearch', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockClear();
    mockPush.mockClear();
  });

  it('renders search input with proper placeholder', () => {
    render(<GlobalSearch />);
    
    expect(screen.getByPlaceholderText('Search prompts, templates, community...')).toBeInTheDocument();
  });

  it('has proper touch target size for mobile', () => {
    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('min-h-[44px]');
  });

  it('shows loading spinner during search', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  it('displays search results correctly', async () => {
    const mockResults = {
      success: true,
      data: {
        prompts: [{
          id: '1',
          type: 'prompt' as const,
          title: 'Test Prompt',
          description: 'Test description',
          relevance: 100,
          createdAt: '2024-01-01',
          _count: { likes: 5, uses: 10 },
        }],
        users: [{
          id: '2',
          type: 'user' as const,
          name: 'Test User',
          email: 'test@example.com',
          relevance: 80,
          createdAt: '2024-01-01',
          _count: { prompts: 3, followers: 15 },
        }],
        total: 2,
      },
      query: 'test',
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResults),
    } as Response);

    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('5 likes • 10 uses')).toBeInTheDocument();
      expect(screen.getByText('3 prompts • 15 followers')).toBeInTheDocument();
    });
  });

  it('navigates to correct page when result is clicked', async () => {
    const mockResults = {
      success: true,
      data: {
        prompts: [{
          id: 'prompt-1',
          type: 'prompt' as const,
          title: 'Test Prompt',
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
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.focus(input);

    await waitFor(() => {
      const promptResult = screen.getByText('Test Prompt');
      fireEvent.click(promptResult.closest('button')!);
    });

    expect(mockPush).toHaveBeenCalledWith('/prompts/prompt-1');
  });

  it('saves and displays recent searches', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['previous search']));
    
    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('Recent searches')).toBeInTheDocument();
    expect(screen.getByText('previous search')).toBeInTheDocument();
  });

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

  it('shows no results message when search returns empty', async () => {
    const mockResults = {
      success: true,
      data: {
        prompts: [],
        users: [],
        total: 0,
      },
      query: 'nonexistent',
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResults),
    } as Response);

    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
    });
  });

  it('debounces search requests', async () => {
    render(<GlobalSearch />);
    
    const input = screen.getByRole('textbox');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 't' } });
    fireEvent.change(input, { target: { value: 'te' } });
    fireEvent.change(input, { target: { value: 'test' } });

    // Should only make one API call after debounce delay
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
