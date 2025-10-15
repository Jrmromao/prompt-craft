import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateLibrary } from '@/components/TemplateLibrary';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe('Template Library Component', () => {
  it('should render template cards', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('Proven Templates')).toBeInTheDocument();
    expect(screen.getByText('Copy-paste prompts that actually work')).toBeInTheDocument();
    expect(screen.getByText('Viral Content Creator')).toBeInTheDocument();
    expect(screen.getByText('High-Converting Sales Email')).toBeInTheDocument();
  });

  it('should show template ratings and usage stats', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getAllByText('4.9')).toHaveLength(2); // Two templates have 4.9 rating
    expect(screen.getByText('12.3k uses')).toBeInTheDocument();
    expect(screen.getByText('8.7k uses')).toBeInTheDocument();
  });

  it('should display template categories', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  it('should show template content', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText(/Create viral content about/)).toBeInTheDocument();
    expect(screen.getByText(/Write a sales email for/)).toBeInTheDocument();
  });

  it('should have copy buttons for each template', () => {
    render(<TemplateLibrary />);
    
    const copyButtons = screen.getAllByText('Copy');
    expect(copyButtons.length).toBeGreaterThan(0);
  });

  it('should show variable input fields', () => {
    render(<TemplateLibrary />);
    
    // Check for placeholder text that indicates variable inputs
    expect(screen.getByPlaceholderText('TOPIC')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PLATFORM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AUDIENCE')).toBeInTheDocument();
  });

  it('should update template content when variables are filled', () => {
    render(<TemplateLibrary />);
    
    const topicInput = screen.getByPlaceholderText('TOPIC');
    fireEvent.change(topicInput, { target: { value: 'AI Technology' } });
    
    // The template should now show the filled variable
    expect(screen.getByText(/AI Technology/)).toBeInTheDocument();
  });

  it('should copy template to clipboard when copy button is clicked', async () => {
    render(<TemplateLibrary />);
    
    const copyButtons = screen.getAllByText('Copy');
    fireEvent.click(copyButtons[0]);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
