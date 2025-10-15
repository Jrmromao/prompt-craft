import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      expect(screen.getByText('🚀 Unlock the Playground')).toBeInTheDocument();
      expect(screen.getByText(/Test prompts instantly/)).toBeInTheDocument();
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
      expect(screen.getByText(/Run Prompt/)).toBeInTheDocument();
    });
  });

  it('shows upgrade button for PRO plan', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        planType: 'FREE',
        playgroundRunsThisMonth: 0,
      }),
    });

    render(<Playground />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade to PRO - $35/month')).toBeInTheDocument();
    });
  });
});
