'use client';

import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

// UI Components
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@shared/components';

// Local Components/Hooks
import { ContactHeader } from './ContactHeader';
import { useContactForm } from '@features/contact-section/hooks';
import { WeddingFields } from '@features/contact-section/components/WeddingFields';
import { cn } from '@shared/utils/styling/tailwindUtils';
import { mapCtaVariant } from '@shared/components/common/CtaButton';
import type { ContactSubmitButton } from '../types';
import { contactFormCopy } from '../formCopy';
import { TurnstileWidget } from './TurnstileWidget';
import type { Locale } from '@shared/config/preferences';

interface ContactFormProps {
  lang?: Locale;
  presentation?: 'standalone' | 'embedded';
  submitButton?: ContactSubmitButton;
  isEmailEnabled?: boolean;
  turnstileSiteKey?: string;
}

export function ContactForm({
  lang = 'en',
  presentation = 'standalone',
  submitButton,
  isEmailEnabled = false,
  turnstileSiteKey,
}: ContactFormProps) {
  const {
    form,
    onSubmit,
    isPending,
    isWedding,
    turnstileToken,
    turnstileResetKey,
    onTurnstileTokenChange,
  } = useContactForm(lang);
  const copy = contactFormCopy[lang];

  return (
    <div
      data-testid='contact-form'
      data-presentation={presentation}
      className={cn(
        'w-full min-w-0',
        presentation === 'standalone' && 'mx-auto max-w-lg p-4 md:p-8'
      )}
    >
      {presentation === 'standalone' && (
        <ContactHeader isWedding={isWedding} lang={lang} />
      )}

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex min-w-0 flex-col gap-6'
        >
          <input type='hidden' {...form.register('type')} />

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-text-primary'>{copy.name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={copy.namePlaceholder}
                    autoComplete='given-name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='surname'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-text-primary'>
                  {copy.surname}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={copy.surnamePlaceholder}
                    autoComplete='family-name'
                    aria-required='true'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-text-primary'>
                  {copy.email}
                </FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder={copy.emailPlaceholder}
                    autoComplete='email'
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence mode='popLayout'>
            {isWedding && <WeddingFields form={form} lang={lang} />}
          </AnimatePresence>

          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-text-primary'>
                  {copy.message}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      isWedding
                        ? copy.weddingMessagePlaceholder
                        : copy.commercialMessagePlaceholder
                    }
                    className='resize-none'
                    autoComplete='off'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isEmailEnabled && turnstileSiteKey && (
            <TurnstileWidget
              siteKey={turnstileSiteKey}
              lang={lang}
              resetKey={turnstileResetKey}
              onTokenChange={onTurnstileTokenChange}
              errorMessage={copy.verificationUnavailable}
            />
          )}

          <Button
            type='submit'
            variant={mapCtaVariant(submitButton?.style ?? 'primary')}
            size={submitButton?.size ?? 'default'}
            disabled={
              isPending ||
              !isEmailEnabled ||
              !turnstileSiteKey ||
              !turnstileToken
            }
            aria-busy={isPending}
            className={cn(
              'max-w-full wrap-anywhere whitespace-normal',
              presentation === 'standalone'
                ? 'w-full'
                : 'self-center lg:self-start'
            )}
          >
            {isPending && (
              <Loader2
                data-icon='inline-start'
                aria-hidden='true'
                className='animate-spin'
              />
            )}
            {isPending
              ? copy.sending
              : submitButton?.label?.trim() || copy.submit}
          </Button>
          {!isEmailEnabled && (
            <p role='status' className='text-text-secondary text-sm'>
              {copy.unavailable}
            </p>
          )}
          {isEmailEnabled && (
            <p role='status' className='text-text-secondary text-sm'>
              {!turnstileSiteKey
                ? copy.verificationUnavailable
                : !turnstileToken
                  ? copy.verificationPrompt
                  : null}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
