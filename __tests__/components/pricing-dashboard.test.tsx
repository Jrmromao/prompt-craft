/**
 * Component tests for Pricing Dashboard
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingPage from '../../app/pricing/page';

// Mock fetch
global.fetch = jest.fn();

const mockPricingData = [
  {
    model: 'gpt-4',
    provider: 'openai',
    inputCost: 30,
    outputCost: 60,
    averageCost: 45,
    region: undefined,
    cacheHit: false,
    cacheHitCost: undefined,
    lastUpdated: '2024-01-15T10:00:00Z',
    source: 'scraper',
  },
  {
    model: 'deepseek-chat',
    provider: 'deepseek',
    inputCost: 0.28,
    outputCost: 0.42,
    averageCost: 0.35,
    region: undefined,
    cacheHit: true,
    cacheHitCost: 0.028,
    lastUpdated: '2024-01-15T10:00:00Z',
    source: 'scraper',
  },
];

describe('Pricing Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PricingPage />);

    expect(screen.getByText('Loading pricing data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render pricing data when loaded successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockPricingData,
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('AI Model Pricing Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('openai (1 models)')).toBeInTheDocument();
    expect(screen.getByText('deepseek (1 models)')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
    expect(screen.getByText('deepseek-chat')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Failed to fetch pricing data',
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('❌ Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch pricing data')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should trigger pricing scrape when Update Pricing button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockPricingData,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Pricing scrape completed successfully',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockPricingData,
        }),
      });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('Update Pricing')).toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Pricing');
    fireEvent.click(updateButton);

    expect(screen.getByText('Scraping...')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/pricing/scrape', {
        method: 'POST',
      });
    });
  });

  it('should refresh data when Refresh button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockPricingData,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockPricingData,
        }),
      });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should display empty state when no pricing data is available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [],
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('No pricing data available')).toBeInTheDocument();
    });

    expect(screen.getByText('Click "Update Pricing" to scrape current rates')).toBeInTheDocument();
  });

  it('should format prices correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockPricingData,
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('$30.0000/1M')).toBeInTheDocument();
      expect(screen.getByText('$60.0000/1M')).toBeInTheDocument();
      expect(screen.getByText('$45.0000/1M')).toBeInTheDocument();
      expect(screen.getByText('$0.2800/1M')).toBeInTheDocument();
      expect(screen.getByText('$0.4200/1M')).toBeInTheDocument();
      expect(screen.getByText('$0.3500/1M')).toBeInTheDocument();
    });
  });

  it('should display cache hit information correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: mockPricingData,
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('$0.0280')).toBeInTheDocument(); // Cache hit cost
      expect(screen.getByText('No')).toBeInTheDocument(); // No cache hit for gpt-4
    });
  });

  it('should group models by provider', async () => {
    const multiProviderData = [
      ...mockPricingData,
      {
        model: 'gpt-3.5-turbo',
        provider: 'openai',
        inputCost: 0.5,
        outputCost: 1.5,
        averageCost: 1,
        region: undefined,
        cacheHit: false,
        cacheHitCost: undefined,
        lastUpdated: '2024-01-15T10:00:00Z',
        source: 'scraper',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: multiProviderData,
      }),
    });

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('openai (2 models)')).toBeInTheDocument();
      expect(screen.getByText('deepseek (1 models)')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PricingPage />);

    await waitFor(() => {
      expect(screen.getByText('❌ Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch pricing data')).toBeInTheDocument();
  });
});
