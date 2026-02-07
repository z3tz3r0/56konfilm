'use client';

import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { UseFormReturn } from 'react-hook-form';
import type { ContactFormValues } from '@/lib/schemas/contact';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface WeddingFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  lang?: 'en' | 'th';
}

export function WeddingFields({ form, lang = 'en' }: WeddingFieldsProps) {
  const dateFormatter = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-US', {
    dateStyle: 'medium',
  });

  return (
    <motion.div
      key="wedding-fields"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="space-y-6 overflow-hidden"
    >
      <FormField
        control={form.control}
        name="weddingDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Wedding Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="secondary"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value instanceof Date ? (
                      dateFormatter.format(field.value)
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value as Date | undefined}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="venue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venue</FormLabel>
            <FormControl>
              <Input
                placeholder="City, Country or Venue Name"
                autoComplete="organization"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
}
