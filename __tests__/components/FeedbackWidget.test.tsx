import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/use-toast');
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test-page',
  },
  writable: true,
});

describe('FeedbackWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render floating button', () => {
    render(<FeedbackWidget />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('rounded-full');
  });

  it('should show modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Send Feedback')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget />);
    
    // Open modal
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(screen.queryByText('Send Feedback')).not.toBeInTheDocument();
  });

  it('should handle star rating', async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget />);
    
    // Open modal
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    // Click on 4th star
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.classList.contains('h-6')
    );
    await user.click(stars[3]); // 4th star (0-indexed)
    
    // Check if stars are filled
    const filledStars = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg?.classList.contains('fill-yellow-400');
    });
    expect(filledStars).toHaveLength(4);
  });

  it('should submit feedback successfully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'feedback-1' } }),
    });

    render(<FeedbackWidget />);
    
    // Open modal
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    // Fill form
    await user.type(screen.getByLabelText('Title'), 'Test Bug Report');
    await user.type(screen.getByLabelText('Message'), 'This is a test bug report message');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'GENERAL_FEEDBACK',
          category: 'OTHER',
          title: 'Test Bug Report',
          message: 'This is a test bug report message',
          rating: undefined,
          email: '',
          url: 'https://example.com/test-page',
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Feedback sent!',
      description: 'Thank you for your feedback. We\'ll review it soon.',
    });
  });

  it('should handle submission errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Server error' }),
    });

    render(<FeedbackWidget />);
    
    // Open modal
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    // Fill form
    await user.type(screen.getByLabelText('Title'), 'Test Bug Report');
    await user.type(screen.getByLabelText('Message'), 'This is a test bug report message');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to send feedback. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('should disable submit button when form is incomplete', async () => {
    const user = userEvent.setup();
    render(<FeedbackWidget />);
    
    // Open modal
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    expect(submitButton).toBeDisabled();
    
    // Fill only title
    await user.type(screen.getByLabelText('Title'), 'Test Title');
    expect(submitButton).toBeDisabled();
    
    // Fill message too
    await user.type(screen.getByLabelText('Message'), 'Test message');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 100))
    );

    render(<FeedbackWidget />);
    
    // Open modal and fill form
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    await user.type(screen.getByLabelText('Title'), 'Test Title');
    await user.type(screen.getByLabelText('Message'), 'Test message');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(submitButton);
    
    // Check loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<FeedbackWidget />);
    
    // Open modal and fill form
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    await user.type(screen.getByLabelText('Title'), 'Test Title');
    await user.type(screen.getByLabelText('Message'), 'Test message');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Send Feedback')).not.toBeInTheDocument();
    });
    
    // Reopen modal and check if form is reset
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Title should be empty
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<FeedbackWidget />);
    
    // Open modal and fill form
    const openButton = screen.getByRole('button');
    await user.click(openButton);
    
    await user.type(screen.getByLabelText('Title'), 'Test Title');
    await user.type(screen.getByLabelText('Message'), 'Test message');
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send feedback/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to send feedback. Please try again.',
        variant: 'destructive',
      });
    });
  });
});
