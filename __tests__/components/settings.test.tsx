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
  default: (url: string) => {
    if (url === '/api/settings') {
      return {
        data: mockSettingsData,
        error: null,
        isLoading: false,
      };
    }
    if (url === '/api/settings/login-history') {
      return {
        data: mockLoginHistory,
        error: null,
        isLoading: false,
      };
    }
    return {
      data: {
        totalCreditsUsed: 100,
        creditsRemaining: 900,
        creditCap: 1000,
        lastCreditReset: new Date().toISOString(),
        totalRequests: 50,
        dailyUsage: [],
        recentActivity: [],
      },
      error: null,
      isLoading: false,
    };
  },
}));

describe('Settings Components', () => {
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

      // Switch to security tab
      const securityButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(securityButton);

      // Fill in password form
      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

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
      const submitButton = screen.getByRole('button', { name: /change password/i });
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

      // Switch to security tab
      const securityButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(securityButton);

      // Fill in password form
      const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);

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
      const submitButton = screen.getByRole('button', { name: /change password/i });
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

      // Switch to security tab
      const securityButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(securityButton);

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

      // Switch to security tab
      const securityButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(securityButton);

      // Click revoke button for first session
      const revokeButton = screen.getByRole('button', { name: /revoke/i });
      fireEvent.click(revokeButton);

      // Check for error message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to revoke session',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Email Preferences', () => {
    it('should update email preferences successfully', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<ProfileClient user={mockUser} currentPath="/profile" />);

      // Switch to settings tab
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);

      // Toggle marketing emails switch
      const marketingSwitch = screen.getByRole('switch', { name: /marketing emails/i });
      fireEvent.click(marketingSwitch);

      // Check for success message
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Settings updated successfully',
        });
      });
    });
  });
}); 