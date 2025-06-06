import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileClient } from '@/app/profile/ProfileClient';
import { useToast } from '@/components/ui/use-toast';
import { useClerk } from '@clerk/nextjs';

// Mock dynamic imports
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the hooks and modules
jest.mock('@clerk/nextjs', () => ({
  useClerk: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams('?tab=settings'),
}));

// Mock settings data
const mockSettingsData = {
  emailPreferences: {
    marketingEmails: false,
    productUpdates: true,
    securityAlerts: true,
  },
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: false,
    browserNotifications: true,
  },
  languagePreferences: {
    language: 'en',
  },
  themeSettings: {
    theme: 'light',
    accentColor: 'purple',
  },
};

// Mock login history data
const mockLoginHistory = [
  {
    id: '1',
    device: 'Chrome on MacOS',
    location: 'San Francisco, CA',
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: '2',
    device: 'Safari on iOS',
    location: 'New York, NY',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    current: false,
  },
];

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key) => {
    if (key === '/api/settings') {
      return {
        data: {
          emailPreferences: {
            marketingEmails: false,
            productUpdates: true,
            securityAlerts: true
          },
          notificationSettings: {
            emailNotifications: true,
            pushNotifications: false,
            browserNotifications: true
          },
          languagePreferences: {
            language: 'en'
          },
          themeSettings: {
            theme: 'light',
            accentColor: 'purple'
          },
          securitySettings: {
            twoFactorEnabled: false,
            sessionTimeout: 30
          },
          sessions: []
        },
        error: null,
        isLoading: false,
        mutate: jest.fn()
      };
    }
    if (key === '/api/settings/login-history') {
      return {
        data: [
          {
            id: '1',
            device: 'Chrome on MacOS',
            location: 'San Francisco, CA',
            lastActive: '2024-03-20T10:00:00Z'
          }
        ],
        error: null,
        isLoading: false,
        mutate: jest.fn()
      };
    }
    return {
      data: null,
      error: null,
      isLoading: true,
      mutate: jest.fn()
    };
  })
}));

describe.skip('Settings Components', () => {
  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    planType: 'FREE',
    credits: 100,
    creditCap: 1000,
  };

  const mockToast = {
    toast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    (useClerk as any).mockReturnValue({
      signOut: jest.fn(),
    });
  });

  describe('Password Change', () => {
    it('should show error when passwords do not match', async () => {
      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // First switch to security tab
      const securityTab = screen.getByTestId('security-tab-button');
      fireEvent.click(securityTab);

      // Fill in password form
      const currentPasswordInput = screen.getByTestId('current-password-input');
      const newPasswordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      fireEvent.change(currentPasswordInput, {
        target: { value: 'oldPassword123' },
      });
      fireEvent.change(newPasswordInput, {
        target: { value: 'newPassword123' },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'differentPassword' },
      });

      // Submit form
      const submitButton = screen.getByTestId('change-password-button');
      fireEvent.click(submitButton);

      // Check for error message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'New passwords do not match',
          variant: 'destructive',
        });
      });
    });

    it('should show success message when password is changed', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // First switch to security tab
      const securityTab = screen.getByTestId('security-tab-button');
      fireEvent.click(securityTab);

      // Fill in password form
      const currentPasswordInput = screen.getByTestId('current-password-input');
      const newPasswordInput = screen.getByTestId('new-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      fireEvent.change(currentPasswordInput, {
        target: { value: 'oldPassword123' },
      });
      fireEvent.change(newPasswordInput, {
        target: { value: 'newPassword123' },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'newPassword123' },
      });

      // Submit form
      const submitButton = screen.getByTestId('change-password-button');
      fireEvent.click(submitButton);

      // Check for success message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Password changed successfully',
        });
      });
    });
  });

  describe('Session Management', () => {
    it('should show success message when session is revoked', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // First switch to security tab
      const securityTab = screen.getByTestId('security-tab-button');
      fireEvent.click(securityTab);

      // Click revoke button for first session
      const revokeButton = screen.getByRole('button', { name: /revoke/i });
      fireEvent.click(revokeButton);

      // Check for success message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Session revoked successfully',
        });
      });
    });

    it('should show error message when session revocation fails', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // First switch to security tab
      const securityTab = screen.getByTestId('security-tab-button');
      fireEvent.click(securityTab);

      // Click revoke button for first session
      const revokeButton = screen.getByRole('button', { name: /revoke/i });
      fireEvent.click(revokeButton);

      // Check for error message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to revoke session',
        });
      });
    });
  });

  describe('Email Preferences', () => {
    it('should update email preferences successfully', async () => {
      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // Switch to overview tab
      const overviewTab = screen.getByTestId('overview-tab-button');
      fireEvent.click(overviewTab);

      // Toggle marketing emails switch
      const marketingSwitch = screen.getByLabelText('Marketing Emails');
      fireEvent.click(marketingSwitch);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Settings updated')).toBeInTheDocument();
      });
    });
  });
}); 