'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button, buttonStyles } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FormField } from '@/components/ui/form-field';
import { PasswordField } from '@/components/ui/password-field';
import { applyApiErrors } from '@/lib/form-errors';
import type { Session } from '@/types/api';
import { landingPath, useLogin } from '../api';
import { loginSchema, type LoginValues } from '../schemas';

type LoginFormProps = {
  defaultEmail?: string;
  /** Replaces the usual redirect, e.g. the invite page continues to "Join" after logging in. */
  onLoggedIn?: (session: Session) => void;
  /** Inside another flow: no sign-up links below the form. */
  embedded?: boolean;
};

export function LoginForm({ defaultEmail, onLoggedIn, embedded = false }: LoginFormProps = {}) {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: defaultEmail ?? '', password: '' } });

  // Carried to the forgot-password page so it needn't be typed twice.
  const typedEmail = useWatch({ control, name: 'email' }).trim();

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: (session) => (onLoggedIn ? onLoggedIn(session) : router.replace(landingPath(session))),
      onError: (error) => setFormError(applyApiErrors(error, setError, ['email', 'password'])),
    });
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert>{formError}</Alert>}

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          className="h-12"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          id="password"
          label="Password"
          aside={
            <Link
              href={typedEmail ? `/forgot-password?email=${encodeURIComponent(typedEmail)}` : '/forgot-password'}
              className="font-bold text-accent hover:underline"
            >
              Forgot password?
            </Link>
          }
          autoComplete="current-password"
          className="h-12"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={login.isPending} size="lg" className="mt-1 w-full">
          Log in
        </Button>
      </form>

      {!embedded && (
        <>
      <Divider>New here?</Divider>

      <Link href="/register" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
        Create an account
      </Link>

      <Alert tone="brand" icon={Mail}>
        Invited to a family? Open the link in your invite email to join it.
      </Alert>
        </>
      )}
    </div>
  );
}
