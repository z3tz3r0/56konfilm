'use client';

import { submitContactForm } from '@features/contact-section/actions';
import type { Locale } from '@shared/config/preferences';
import { useMode } from '@shared/hooks';
import {
  contactFormSchema,
  type ContactFormValues,
  type ContactSubmission,
} from '@features/contact-section/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { toast } from 'sonner';
import { contactFormCopy } from '../formCopy';

export function useContactForm(lang: Locale = 'en') {
  const { mode } = useMode();
  const [isPending, startTransition] = useTransition();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const onTurnstileTokenChange = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);
  const currentType = mode === 'wedding' ? 'wedding' : 'commercial';

  const form = useForm<ContactFormValues, unknown, ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: currentType,
      name: '',
      surname: '',
      email: '',
      message: '',
      venue: '',
    } as DefaultValues<ContactFormValues>,
    mode: 'onBlur',
  });

  // Keep type in sync with global mode
  useEffect(() => {
    form.setValue('type', currentType);
    if (currentType === 'commercial') {
      form.clearErrors(['weddingDate', 'venue']);
    }
  }, [currentType, form]);

  const onSubmit = async (data: ContactFormValues) => {
    startTransition(async () => {
      const submission: ContactSubmission =
        data.type === 'wedding'
          ? {
              ...data,
              weddingDate: [
                data.weddingDate.getFullYear(),
                String(data.weddingDate.getMonth() + 1).padStart(2, '0'),
                String(data.weddingDate.getDate()).padStart(2, '0'),
              ].join('-'),
            }
          : data;
      try {
        const result = await submitContactForm(submission, turnstileToken);

        if (result.success) {
          toast.success(result.message);
          form.reset();
          form.setValue('type', currentType);
        } else if (result.reason === 'verification') {
          toast.error(contactFormCopy[lang].verificationFailed);
        } else if (result.reason === 'rate-limit') {
          toast.error(contactFormCopy[lang].rateLimited);
        } else if (result.errors) {
          toast.error('Please fix the errors in the form.');
        } else {
          toast.error(result.message || 'Something went wrong.');
        }
      } catch {
        toast.error(contactFormCopy[lang].submissionFailed);
      } finally {
        setTurnstileToken(null);
        setTurnstileResetKey((current) => current + 1);
      }
    });
  };

  return {
    form,
    onSubmit,
    isPending,
    isWedding: mode === 'wedding',
    turnstileToken,
    turnstileResetKey,
    onTurnstileTokenChange,
  };
}
