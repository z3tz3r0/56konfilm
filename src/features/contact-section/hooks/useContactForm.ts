'use client';

import { submitContactForm } from '@features/contact-section/actions';
import type { Locale } from '@shared/config/preferences';
import { useMode } from '@shared/hooks';
import {
  createContactFormSchema,
  type ContactFormValues,
  type ContactSubmission,
} from '../validation/contactSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useForm, type DefaultValues, type FieldPath } from 'react-hook-form';
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
  const copy = contactFormCopy[lang];
  const schema = useMemo(() => createContactFormSchema(lang), [lang]);
  const previousLang = useRef(lang);

  const form = useForm<ContactFormValues, unknown, ContactFormValues>({
    resolver: zodResolver(schema),
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

  // Refresh existing errors after a locale switch without resetting input values.
  useEffect(() => {
    if (previousLang.current === lang) return;
    previousLang.current = lang;
    const fields = Object.keys(
      form.formState.errors
    ) as FieldPath<ContactFormValues>[];
    if (fields.length) void form.trigger(fields);
  }, [lang, form, form.formState.errors]);

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
          toast.success(
            data.type === 'wedding'
              ? copy.weddingSuccess
              : copy.commercialSuccess
          );
          form.reset();
          form.setValue('type', currentType);
        } else if (result.reason === 'verification') {
          toast.error(copy.verificationFailed);
        } else if (result.reason === 'rate-limit') {
          toast.error(copy.rateLimited);
        } else if (result.reason === 'unavailable') {
          toast.error(copy.unavailable);
        } else if (result.reason === 'unconfirmed') {
          toast.error(copy.submissionUnconfirmed);
        } else if (result.errors) {
          toast.error(copy.validationFailed);
        } else {
          toast.error(copy.submissionFailed);
        }
      } catch {
        toast.error(copy.submissionFailed);
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
