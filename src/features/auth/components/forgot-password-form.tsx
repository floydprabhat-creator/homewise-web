'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { PasswordField } from '@/components/ui/password-field';
import { ApiError } from '@/lib/api-client';
import { apiErrorMessage } from '@/lib/form-errors';
import { landingPath, useResetPassword, useSendResetCode } from '../api';

type Errors = Partial<Record<'email' | 'code' | 'newPassword' | 'confirm' | 'form', string>>;

const RESEND_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 1. Email → a 6-digit code is sent. 2. Code + new password → signed in. */
export function ForgotPasswordForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const router = useRouter();
  const sendCode = useSendResetCode();
  const reset = useResetPassword();
  const [values, setValues] = useState({ email: defaultEmail, code: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Ticks the "Resend in 42s" countdown.
  useEffect(() => {
    if (!sentAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sentAt]);
  const resendIn = sentAt ? Math.max(0, RESEND_SECONDS - Math.floor((now - sentAt) / 1000)) : 0;

  const set = (field: keyof typeof values) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined, form: undefined }));
  };

  function requestCode(e?: FormEvent) {
    e?.preventDefault();
    const email = (sentTo ?? values.email).trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) return setErrors({ email: 'Enter a valid email address' });
    setErrors({});
    sendCode.mutate(email, {
      onSuccess: () => {
        setSentTo(email);
        setSentAt(Date.now());
        setNow(Date.now());
      },
      onError: (err) => setErrors({ [sentTo ? 'code' : 'email']: apiErrorMessage(err) }),
    });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!/^\d{6}$/.test(values.code.trim())) next.code = 'Enter the 6-digit code';
    if (values.newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters';
    if (values.confirm !== values.newPassword) next.confirm = "The passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0 || !sentTo) return;

    reset.mutate(
      { email: sentTo, code: values.code.trim(), newPassword: values.newPassword },
      {
        onSuccess: (session) => router.replace(landingPath(session)),
        onError: (err) => {
          const fields = err instanceof ApiError ? err.fields : {};
          setErrors({
            code: fields.code,
            newPassword: fields.newPassword,
            form: fields.code || fields.newPassword ? undefined : apiErrorMessage(err),
          });
        },
      },
    );
  }

  const backToLogin = (
    <Link href="/login" className="inline-flex items-center gap-1.5 self-center text-caption font-bold text-accent hover:underline">
      <ArrowLeft aria-hidden className="size-4" />
      Back to log in
    </Link>
  );

  if (!sentTo) {
    return (
      <div className="flex flex-col gap-6">
        <form onSubmit={requestCode} noValidate className="flex flex-col gap-5">
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            className="h-12"
            value={values.email}
            error={errors.email}
            onChange={set('email')}
          />
          <Button type="submit" loading={sendCode.isPending} size="lg" className="mt-1 w-full">
            Send code
          </Button>
        </form>
        {backToLogin}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Alert tone="brand" icon={Mail}>
        If <b className="font-semibold">{sentTo}</b> has a HomeWise account, a 6-digit code is on its way. It works for 10
        minutes.
      </Alert>

      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {errors.form && <Alert>{errors.form}</Alert>}

        <div className="flex flex-wrap items-start gap-2.5">
          <div className="min-w-40 flex-1">
            <FormField
              id="reset-code"
              label="Code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="h-12"
              value={values.code}
              error={errors.code}
              onChange={set('code')}
            />
          </div>
          <Button variant="outline" size="lg" className="mt-[26px]" loading={sendCode.isPending} disabled={resendIn > 0} onClick={() => requestCode()}>
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
          </Button>
        </div>
        <PasswordField
          id="new-password"
          label="New password"
          aside="At least 8 characters"
          autoComplete="new-password"
          className="h-12"
          value={values.newPassword}
          error={errors.newPassword}
          onChange={set('newPassword')}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          className="h-12"
          value={values.confirm}
          error={errors.confirm}
          onChange={set('confirm')}
        />

        <Button type="submit" loading={reset.isPending} size="lg" className="mt-1 w-full">
          Reset password and log in
        </Button>
      </form>

      <button
        type="button"
        className="self-center text-caption font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => {
          setSentTo(null);
          setSentAt(null);
          setErrors({});
          setValues((v) => ({ ...v, code: '' }));
        }}
      >
        Use a different email
      </button>
      {backToLogin}
    </div>
  );
}
