'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import type { Session } from '@/types/api';
import { landingPath, useRegister } from '../api';
import { registerSchema, type RegisterValues } from '../schemas';

type RegisterFormProps = {
  /** Signing up from an invite: the email is fixed and the account joins the family as a member. */
  invite?: { token: string; email: string };
  onRegistered?: (session: Session) => void;
  embedded?: boolean;
};

export function RegisterForm({ invite, onRegistered, embedded = false }: RegisterFormProps = {}) {
  const router = useRouter();
  const registerUser = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: invite?.email ?? '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    registerUser.mutate(invite ? { ...values, inviteToken: invite.token } : values, {
      onSuccess: (session) => (onRegistered ? onRegistered(session) : router.replace(landingPath(session))),
      onError: (error) => setFormError(applyApiErrors(error, setError, ['name', 'email', 'password'])),
    });
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert>{formError}</Alert>}

        <FormField id="name" label="Name" autoComplete="name" className="h-12" error={errors.name?.message} {...register('name')} />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          readOnly={Boolean(invite)}
          hint={invite ? 'The email this invite was sent to' : undefined}
          className="h-12 read-only:bg-neutral read-only:text-muted-foreground"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          id="password"
          label="Password"
          aside="At least 8 characters"
          autoComplete="new-password"
          className="h-12"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={registerUser.isPending} size="lg" className="mt-1 w-full">
          Create account
        </Button>
      </form>

      {!embedded && (
        <>
      <Divider>Already have an account?</Divider>

      <Link href="/login" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
        Log in
      </Link>
        </>
      )}
    </div>
  );
}
