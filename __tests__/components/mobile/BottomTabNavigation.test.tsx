import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { BottomTabNavigation } from '@/components/mobile/BottomTabNavigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('BottomTabNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('renders all navigation tabs', () => {
    render(<BottomTabNavigation />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('highlights active tab based on pathname', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<BottomTabNavigation />);
    
    const homeTab = screen.getByText('Home').closest('a');
    expect(homeTab).toHaveClass('text-purple-600');
  });

  it('has proper touch targets (minimum 60px)', () => {
    render(<BottomTabNavigation />);
    
    const tabs = screen.getAllByRole('link');
    tabs.forEach(tab => {
      expect(tab).toHaveClass('min-h-[60px]', 'min-w-[60px]');
    });
  });

  it('includes touch-manipulation for better mobile interaction', () => {
    render(<BottomTabNavigation />);
    
    const tabs = screen.getAllByRole('link');
    tabs.forEach(tab => {
      expect(tab).toHaveClass('touch-manipulation');
    });
  });

  it('is hidden on desktop (md:hidden)', () => {
    render(<BottomTabNavigation />);
    
    const navigation = screen.getByRole('navigation', { hidden: true });
    expect(navigation).toHaveClass('md:hidden');
  });
});
