import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { toast } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock useSWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key) => {
    if (key.includes('/api/settings/')) {
      return {
        data: {
          theme: 'light',
          notifications: true,
          language: 'en',
        },
        error: null,
        isLoading: false,
        mutate: jest.fn(),
      };
    }
    return {
      data: null,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    };
  }),
  SWRConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock ThemeProvider
jest.mock('@/components/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ theme: 'dark', notifications: false, language: 'en' }),
  })
) as jest.Mock;

describe.skip('Settings Components', () => {
  const mockUser = {
    id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          {ui}
        </SWRConfig>
      </ThemeProvider>
    );
  };

  it('should update theme successfully', async () => {
    const mutate = jest.fn();
    jest.spyOn(require('swr'), 'default').mockImplementation(() => ({
      data: { theme: 'light', notifications: true, language: 'en' },
      error: null,
      isLoading: false,
      mutate,
    }));

    // renderWithProviders(<SettingsSection user={mockUser} />);

    // Wait for the theme select to be rendered and find it by ID
    const themeSelect = await screen.findByLabelText('Theme');
    expect(themeSelect).toBeInTheDocument();

    // Change theme
    fireEvent.click(themeSelect);
    const darkOption = await screen.findByText('Dark');
    fireEvent.click(darkOption);

    // Wait for the update to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/settings/user_123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ theme: 'dark' }),
        })
      );
    });

    expect(mutate).toHaveBeenCalled();
  });

  it('should update notifications successfully', async () => {
    const mutate = jest.fn();
    jest.spyOn(require('swr'), 'default').mockImplementation(() => ({
      data: { theme: 'light', notifications: true, language: 'en' },
      error: null,
      isLoading: false,
      mutate,
    }));

    // renderWithProviders(<SettingsSection user={mockUser} />);

    // Wait for the notification switch to be rendered
    const notificationSwitch = await screen.findByLabelText('Enable Notifications');
    expect(notificationSwitch).toBeInTheDocument();

    // Toggle notifications
    fireEvent.click(notificationSwitch);

    // Wait for the update to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/settings/user_123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ notifications: false }),
        })
      );
    });

    expect(mutate).toHaveBeenCalled();
  });

  it('should show loading state', async () => {
    jest.spyOn(require('swr'), 'default').mockImplementation(() => ({
      data: null,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    }));

    // renderWithProviders(<SettingsSection user={mockUser} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    jest.spyOn(require('swr'), 'default').mockImplementation(() => ({
      data: null,
      error: new Error('Failed to fetch'),
      isLoading: false,
      mutate: jest.fn(),
    }));

    // renderWithProviders(<SettingsSection user={mockUser} />);

    expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
  });
});
