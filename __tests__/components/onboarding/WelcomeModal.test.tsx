import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';

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

describe('WelcomeModal', () => {
  const newUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  };

  const oldUser = {
    id: 'user-456',
    name: 'Jane Doe',
    email: 'jane@example.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
  };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);
    
    jest.clearAllMocks();
  });

  it('shows modal for new users', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to PromptCraft, John!')).toBeInTheDocument();
    });
  });

  it('does not show modal for old users', () => {
    render(<WelcomeModal user={oldUser} />);
    
    expect(screen.queryByText('Welcome to PromptCraft')).not.toBeInTheDocument();
  });

  it('does not show modal if onboarding already completed', () => {
    mockLocalStorage.getItem.mockReturnValue('true');
    
    render(<WelcomeModal user={newUser} />);
    
    expect(screen.queryByText('Welcome to PromptCraft')).not.toBeInTheDocument();
  });

  it('shows progress indicator with correct steps', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      const progressSteps = screen.getAllByText(/\d/);
      expect(progressSteps).toHaveLength(2); // 2 onboarding steps
    });
  });

  it('navigates through onboarding steps', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Your First Prompt')).toBeInTheDocument();
    });

    // Click Next
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Explore Community')).toBeInTheDocument();
  });

  it('tracks onboarding progress when step action is clicked', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Prompt');
      fireEvent.click(createButton);
    });

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

  it('saves completion status when skipped', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      // Navigate to last step
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
    });

    const skipButton = screen.getByText('Skip for now');
    fireEvent.click(skipButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      `onboarding-completed-${newUser.id}`,
      'true'
    );
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));
    
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Prompt');
      fireEvent.click(createButton);
    });

    // Should still navigate even if tracking fails
    expect(mockPush).toHaveBeenCalledWith('/prompts/create?welcome=true');
  });

  it('shows correct step content and actions', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Create Your First Prompt')).toBeInTheDocument();
      expect(screen.getByText('Start with our AI-powered prompt builder and see the magic happen')).toBeInTheDocument();
      expect(screen.getByText('Create Prompt')).toBeInTheDocument();
    });

    // Navigate to second step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Explore Community')).toBeInTheDocument();
    expect(screen.getByText('Discover thousands of prompts created by our community')).toBeInTheDocument();
    expect(screen.getByText('Browse Prompts')).toBeInTheDocument();
  });

  it('shows progress bar with correct percentage', async () => {
    render(<WelcomeModal user={newUser} />);
    
    await waitFor(() => {
      const progressBar = document.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    // Navigate to second step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const progressBar100 = document.querySelector('[style*="width: 100%"]');
    expect(progressBar100).toBeInTheDocument();
  });
});
