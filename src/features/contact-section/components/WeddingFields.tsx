'use client';

import { cn } from '@shared/utils/styling/tailwindUtils';
import { CalendarIcon } from 'lucide-react';
import { m } from 'motion/react';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { ContactFormValues } from '@features/contact-section/validation';
import type { Locale } from '@shared/config/preferences';
import { contactFormCopy } from '../formCopy';
import {
  Button,
  Calendar,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components';

interface WeddingFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  lang?: Locale;
}

export function WeddingFields({ form, lang = 'en' }: WeddingFieldsProps) {
  const copy = contactFormCopy[lang];
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
        dateStyle: 'medium',
      }),
    [lang]
  );

  return (
    <m.div
      key='wedding-fields'
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className='flex flex-col gap-6 overflow-hidden'
    >
      <FormField
        control={form.control}
        name='weddingDate'
        render={({ field }) => (
          <FormItem className='flex flex-col'>
            <FormLabel className='text-text-primary'>
              {copy.weddingDate}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type='button'
                    variant='input'
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className={cn(
                      'justify-start text-left',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value instanceof Date ? (
                      dateFormatter.format(field.value)
                    ) : (
                      <span>{copy.weddingDatePlaceholder}</span>
                    )}
                    <CalendarIcon
                      data-icon='inline-end'
                      aria-hidden='true'
                      className='ml-auto opacity-50'
                    />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value as Date | undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                    // Opening the calendar blurs the trigger; recheck its error on selection.
                    void form.trigger('weddingDate');
                  }}
                  disabled={(date) =>
                    date < new Date() || date < new Date('1900-01-01')
                  }
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='venue'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-text-primary'>{copy.venue}</FormLabel>
            <FormControl>
              <Input
                placeholder={copy.venuePlaceholder}
                autoComplete='organization'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </m.div>
  );
}
