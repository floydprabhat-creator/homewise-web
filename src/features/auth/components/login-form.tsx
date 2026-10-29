'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/alert';
import { Button, buttonStyles } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FormField } from '@/components/ui/form-field';
import { PasswordField } from '@/components/ui/password-field';
import { applyApiErrors } from '@/lib/form-errors';
import { landingPath, useLogin } from '../api';
import { loginSchema, type LoginValues } from '../schemas';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: (session) => router.replace(landingPath(session)),
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
          aside="At least 8 characters"
          autoComplete="current-password"
          className="h-12"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={login.isPending} size="lg" className="mt-1 w-full">
          Log in
        </Button>
      </form>

      <Divider>New here?</Divider>

      <Link href="/register" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
        Create an account
      </Link>

      <Alert tone="brand" icon={Mail}>
        Invited to a family? Open the link in your invite email to join it.
      </Alert>
    </div>
  );
}
