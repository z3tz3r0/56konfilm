'use client';

import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Local Components/Hooks
import { ContactHeader } from './ContactHeader';
import { useContactForm } from './useContactForm';
import { WeddingFields } from './WeddingFields';

interface ContactFormProps {
  lang?: 'en' | 'th';
}

export function ContactForm({ lang = 'en' }: ContactFormProps) {
  const { form, onSubmit, isPending, isWedding } = useContactForm();

  return (
    <div className="w-full max-w-lg mx-auto p-4 md:p-8">
      <ContactHeader isWedding={isWedding} />

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit as any)} 
          className="space-y-6"
        >
          <input type="hidden" {...form.register('type')} />

          <FormField
            control={form.control as any}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={isWedding ? "Your names" : "Agency / Company Name"} 
                    autoComplete="name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    autoComplete="email"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence mode="popLayout">
            {isWedding && <WeddingFields form={form} lang={lang} />}
          </AnimatePresence>

          <FormField
            control={form.control as any}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={isWedding ? "Tell us about your day…" : "Tell us about your project…"} 
                    className="resize-none" 
                    autoComplete="off"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
