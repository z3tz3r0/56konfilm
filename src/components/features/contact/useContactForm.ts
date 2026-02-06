'use client';

import { submitContactForm } from '@/actions/contact';
import { useMode } from '@/hooks/useMode';
import { contactFormSchema, type ContactFormValues } from '@/lib/schemas/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function useContactForm() {
  const { mode } = useMode();
  const [isPending, startTransition] = useTransition();
  const currentType = mode === 'wedding' ? 'wedding' : 'commercial';

  const form = useForm<ContactFormValues>({
    // @ts-expect-error - Zod discriminated unions can be tricky with RHF generics
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: currentType,
      name: '',
      email: '',
      message: '',
      venue: '',
    } as any,
    mode: 'onBlur',
  });

  // Keep type in sync with global mode
  useEffect(() => {
    form.setValue('type', currentType);
    if (currentType === 'commercial') {
      form.clearErrors(['weddingDate', 'venue'] as any);
    }
  }, [currentType, form]);

  const onSubmit = async (data: ContactFormValues) => {
    startTransition(async () => {
      const result = await submitContactForm(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        form.setValue('type', currentType);
      } else {
        if (result.errors) {
          toast.error('Please fix the errors in the form.');
        } else {
          toast.error(result.message || 'Something went wrong.');
        }
      }
    });
  };

  return {
    form,
    onSubmit,
    isPending,
    isWedding: mode === 'wedding',
  };
}
