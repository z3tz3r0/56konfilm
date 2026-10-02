import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TurnstileWidget } from '@features/contact-section/components/TurnstileWidget';

vi.mock('next/script', () => ({
  default: ({ onReady }: { onReady: () => void }) => (
    <button type='button' onClick={onReady}>
      Load verification
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, 'turnstile');
});

describe('TurnstileWidget', () => {
  it('renders with the public key, clears expired tokens and resets after a response', () => {
    const turnstile = {
      render: vi.fn().mockReturnValue('widget-1'),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    Object.defineProperty(window, 'turnstile', {
      configurable: true,
      value: turnstile,
    });
    const onTokenChange = vi.fn();

    const { rerender, unmount } = render(
      <TurnstileWidget
        siteKey='test-site-key'
        lang='th'
        resetKey={0}
        onTokenChange={onTokenChange}
        errorMessage='Verification unavailable'
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Load verification' }));
    const [container, options] = turnstile.render.mock.calls[0];
    expect(container).toBe(screen.getByTestId('contact-turnstile'));
    expect(options).toMatchObject({ sitekey: 'test-site-key', language: 'th' });
    act(() => options.callback('fresh-token'));
    expect(onTokenChange).toHaveBeenCalledWith('fresh-token');
    act(() => options['expired-callback']());
    expect(onTokenChange).toHaveBeenCalledWith(null);
    act(() => options['error-callback']());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Verification unavailable'
    );

    rerender(
      <TurnstileWidget
        siteKey='test-site-key'
        lang='th'
        resetKey={1}
        onTokenChange={onTokenChange}
        errorMessage='Verification unavailable'
      />
    );
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1');
    unmount();
    expect(turnstile.remove).toHaveBeenCalledWith('widget-1');
  });
});
