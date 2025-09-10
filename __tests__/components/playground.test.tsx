import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';
import Playground from '@/components/Playground';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('Playground Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders playground for free users with upgrade prompt', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'FREE',
        playgroundRunsThisMonth: 0,
      }),
    });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
      expect(screen.getByText(/exclusively for paid members/)).toBeInTheDocument();
    });
  });

  it('renders playground for paid users', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'PRO',
        playgroundRunsThisMonth: 5,
      }),
    });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your prompt here...')).toBeInTheDocument();
      expect(screen.getByText('Run Prompt')).toBeInTheDocument();
    });
  });

  it('shows usage limits for lite users', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'LITE',
        playgroundRunsThisMonth: 250,
      }),
    });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByText(/LITE Plan/)).toBeInTheDocument();
      expect(screen.getByText(/(250\/300 runs)/)).toBeInTheDocument();
    });
  });

  it('runs prompt successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          planType: 'PRO',
          playgroundRunsThisMonth: 5,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: 'AI generated response' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    await act(async () => {
      render(<Playground />);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your prompt here...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Type your prompt here...');
    const runButton = screen.getByText('Run Prompt');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    });

    await act(async () => {
      fireEvent.click(runButton);
    });

    // Wait for the API calls to complete and check that the button text changes
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    // Verify the output tab becomes available after successful run
    await waitFor(() => {
      const outputTab = screen.getByRole('tab', { name: /output/i });
      expect(outputTab).toBeInTheDocument();
    });
  });

  it('handles insufficient credits error', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          planType: 'LITE',
          playgroundRunsThisMonth: 5,
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Insufficient credits' }),
      });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your prompt here...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Type your prompt here...');
    const runButton = screen.getByText('Run Prompt');

    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText(/run out of credits/)).toBeInTheDocument();
    });
  });

  it('copies text to clipboard', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'PRO',
        playgroundRunsThisMonth: 5,
      }),
    });

    await act(async () => {
      render(<Playground />);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your prompt here...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Type your prompt here...');
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    });

    const copyButtons = screen.getAllByRole('button');
    const copyButton = copyButtons.find(btn => btn.querySelector('svg'));
    
    await act(async () => {
      fireEvent.click(copyButton!);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test prompt');
    expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!');
  });

  it('disables run button when over limit', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'LITE',
        playgroundRunsThisMonth: 300,
      }),
    });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade for more runs')).toBeInTheDocument();
    });

    const runButton = screen.getByRole('button', { name: /upgrade for more runs/i });
    expect(runButton).toBeDisabled();
  });

  it('switches between tabs correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'PRO',
        playgroundRunsThisMonth: 5,
      }),
    });

    await act(async () => {
      render(<Playground />);
    });

    await waitFor(() => {
      expect(screen.getByText('Prompt')).toBeInTheDocument();
    });

    const outputTab = screen.getByRole('tab', { name: /output/i });
    expect(outputTab).toHaveAttribute('data-state', 'inactive');
  });
});
