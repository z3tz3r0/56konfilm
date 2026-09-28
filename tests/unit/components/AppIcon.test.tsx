import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppIcon from '@shared/components/common/AppIcon';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className?: string }) => (
    <svg
      data-testid='iconify-icon'
      data-icon-name={icon}
      className={className}
    />
  ),
}));

describe('AppIcon', () => {
  afterEach(cleanup);

  it('preserves the existing circle, theme colors, and icon size by default', () => {
    render(<AppIcon iconName='lucide:camera' />);
    expect(screen.getByTestId('iconify-icon').parentElement).toHaveClass(
      'size-20',
      'rounded-full',
      'bg-text-primary',
      'dark:bg-primary',
      'text-neutral'
    );
    expect(screen.getByTestId('iconify-icon')).toHaveClass('size-10');
  });

  it('provides a plain icon presentation without a circle or background', () => {
    render(<AppIcon iconName='mdi:instagram' variant='plain' />);
    const wrapper = screen.getByTestId('iconify-icon').parentElement;
    expect(wrapper).toHaveAttribute('data-variant', 'plain');
    expect(wrapper).not.toHaveClass(
      'rounded-full',
      'bg-text-primary',
      'dark:bg-primary'
    );
    expect(screen.getByTestId('iconify-icon')).toHaveClass('size-full');
  });

  it('reuses the wrapper for legacy icons without replacing their renderer', () => {
    render(
      <AppIcon className='mx-0 p-4'>
        <svg data-testid='legacy-icon' />
      </AppIcon>
    );
    expect(screen.getByTestId('legacy-icon').parentElement).toHaveClass(
      'mx-0',
      'p-4',
      'rounded-full'
    );
    expect(screen.queryByTestId('iconify-icon')).not.toBeInTheDocument();
  });
});
