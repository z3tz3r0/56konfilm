'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { m, AnimatePresence } from 'motion/react';
import {
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@shared/components';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      router.push('/sanity-cms');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body selection:bg-primary/30 flex min-h-screen items-center justify-center p-6">
      <div className="relative w-full max-w-[440px]">
        {/* Decorative background elements */}
        <div className="bg-primary/5 absolute -top-12 -left-12 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute -right-12 -bottom-12 h-64 w-64 rounded-full blur-3xl" />

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="border-border/50 bg-card/80 relative overflow-hidden backdrop-blur-xl">
            <CardContent className="pt-10 pb-12">
              <div className="mb-10 flex flex-col items-center text-center">
                <m.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(255,123,7,0.3)]"
                >
                  <Lock className="size-6" />
                </m.div>
                <h1 className="font-primary text-foreground text-3xl font-black tracking-tight uppercase sm:text-4xl">
                  56KONFILM
                </h1>
                <p className="text-text-secondary mt-2 text-sm">
                  Content Management System Access
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="text-text-tertiary absolute top-3 left-3 size-4" />
                            <Input
                              {...field}
                              placeholder="admin"
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="text-text-tertiary absolute top-3 left-3 size-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="border-border bg-input/30 text-primary accent-primary focus:ring-primary/20 size-4 rounded outline-none focus:ring-2"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="text-text-secondary cursor-pointer text-xs font-normal select-none">
                          Remember me for 30 days
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <AnimatePresence mode="wait">
                    {error && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
                          <AlertCircle className="size-4 shrink-0" />
                          <p>{error}</p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-base font-bold tracking-wider uppercase"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center">
                <p className="text-text-tertiary text-[10px] tracking-[2px] whitespace-nowrap uppercase">
                  © {new Date().getFullYear()} 56KonFilm Production House
                </p>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </div>
    </div>
  );
}
