import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-ignore - Module does not exist yet
import { ContactForm } from '@/components/features/contact/ContactForm';
import { useMode } from '@/hooks/useMode';

// Mock useMode
vi.mock('@/hooks/useMode', () => ({
  useMode: vi.fn(),
}));

// Mock server action
vi.mock('@/actions/contact', () => ({
  submitContactForm: vi.fn(),
}));

// Mock ResizeObserver for Framer Motion or Layout functionality
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ContactForm Component', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders commercial fields in commercial mode', () => {
        (useMode as any).mockReturnValue({ mode: 'production' });
        // @ts-ignore
        render(<ContactForm />);
        
        // Header check
        expect(screen.getByText(/Commercial Inquiry/i)).toBeInTheDocument();
        
        // Fields check
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Wedding Date/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Venue/i)).not.toBeInTheDocument();
    });

    it('renders wedding fields in wedding mode', () => {
        (useMode as any).mockReturnValue({ mode: 'wedding' });
        // @ts-ignore
        render(<ContactForm />);

        // Header check
        expect(screen.getByText(/Tell us your love story/i)).toBeInTheDocument();
        
        // Fields check
        expect(screen.getByLabelText(/Wedding Date/i)).toBeInTheDocument(); // Might be placeholder or label
        expect(screen.getByLabelText(/Venue/i)).toBeInTheDocument();
    });
});
