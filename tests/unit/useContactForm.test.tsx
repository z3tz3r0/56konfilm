import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useContactForm } from '@features/contact-section/hooks';
import { submitContactForm } from '@features/contact-section/actions';
import { contactFormCopy } from '@features/contact-section/formCopy';
import type { ContactFormValues } from '@features/contact-section/validation';
import { toast } from 'sonner';

const { modeState } = vi.hoisted(() => ({ modeState: { mode: 'production' } }));
vi.mock('@shared/hooks', () => ({ useMode: () => modeState }));
vi.mock('@features/contact-section/actions', () => ({
  submitContactForm: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  modeState.mode = 'production';
});

const commercial: ContactFormValues = {
  type: 'commercial',
  name: 'Example',
  surname: 'Family',
  email: 'visitor@example.com',
  message: 'A detailed project inquiry',
};

describe.each(['en', 'th'] as const)('Contact feedback in %s', (lang) => {
  const copy = contactFormCopy[lang];
  const failures = [
    {
      title: 'unavailable',
      response: { success: false, reason: 'unavailable' as const },
      expected: copy.unavailable,
    },
    {
      title: 'unconfirmed',
      response: { success: false, reason: 'unconfirmed' as const },
      expected: copy.submissionUnconfirmed,
    },
    {
      title: 'verification',
      response: { success: false, reason: 'verification' as const },
      expected: copy.verificationFailed,
    },
    {
      title: 'rate-limit',
      response: { success: false, reason: 'rate-limit' as const },
      expected: copy.rateLimited,
    },
    {
      title: 'server validation',
      response: { success: false, errors: { name: ['Server English error'] } },
      expected: copy.validationFailed,
    },
    {
      title: 'delivery failure',
      response: { success: false },
      expected: copy.submissionFailed,
    },
  ];

  it.each(failures)(
    'localizes $title and retains the form with a fresh verification request',
    async ({ response, expected }) => {
      vi.mocked(submitContactForm).mockResolvedValue({
        ...response,
        message: 'Server English message',
      });
      const { result } = renderHook(() => useContactForm(lang));
      act(() => {
        result.current.form.setValue('name', commercial.name);
        result.current.form.setValue('surname', commercial.surname);
        result.current.onTurnstileTokenChange('visitor-token');
      });
      await act(async () => {
        await result.current.onSubmit(commercial);
      });
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledExactlyOnceWith(expected)
      );
      expect(toast.success).not.toHaveBeenCalled();
      expect(result.current.form.getValues('name')).toBe(commercial.name);
      expect(result.current.form.getValues('surname')).toBe(commercial.surname);
      expect(result.current.turnstileToken).toBeNull();
      expect(result.current.turnstileResetKey).toBe(1);
    }
  );

  it('localizes unexpected action errors without clearing values', async () => {
    vi.mocked(submitContactForm).mockRejectedValue(
      new Error('Private server detail')
    );
    const { result } = renderHook(() => useContactForm(lang));
    act(() => result.current.form.setValue('surname', commercial.surname));
    await act(async () => {
      await result.current.onSubmit(commercial);
    });
    expect(toast.error).toHaveBeenCalledExactlyOnceWith(copy.submissionFailed);
    expect(result.current.form.getValues('surname')).toBe(commercial.surname);
  });

  it.each(['production', 'wedding'] as const)(
    'localizes %s success and preserves wedding date serialization',
    async (mode) => {
      modeState.mode = mode;
      vi.mocked(submitContactForm).mockResolvedValue({
        success: true,
        message: 'Server English success',
      });
      const data: ContactFormValues =
        mode === 'wedding'
          ? {
              ...commercial,
              type: 'wedding',
              venue: 'Example venue',
              weddingDate: new Date(2050, 6, 21),
            }
          : commercial;
      const { result } = renderHook(() => useContactForm(lang));
      act(() => result.current.form.setValue('surname', commercial.surname));
      await act(async () => {
        await result.current.onSubmit(data);
      });
      expect(toast.success).toHaveBeenCalledExactlyOnceWith(
        mode === 'wedding' ? copy.weddingSuccess : copy.commercialSuccess
      );
      expect(toast.error).not.toHaveBeenCalled();
      expect(result.current.form.getValues('surname')).toBe('');
      if (mode === 'wedding')
        expect(submitContactForm).toHaveBeenCalledWith(
          expect.objectContaining({ weddingDate: '2050-07-21' }),
          null
        );
    }
  );
});
