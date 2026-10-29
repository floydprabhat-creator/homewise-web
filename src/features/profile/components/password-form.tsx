'use client';

import { Check, Mail } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { PasswordField } from '@/components/ui/password-field';
import { Tabs } from '@/components/ui/tabs';
import { ApiError } from '@/lib/api-client';
import { apiErrorMessage } from '@/lib/form-errors';
import { useChangePassword, useSendPasswordCode } from '../api';

type Method = 'current' | 'code';
type Errors = Partial<Record<'currentPassword' | 'code' | 'newPassword' | 'confirm' | 'form', string>>;

const RESEND_SECONDS = 60;

/** Prove it's you with the current password, or with a 6-digit code emailed to you if you've forgotten it. */
export function PasswordForm({ email }: { email: string }) {
  const change = useChangePassword();
  const sendCode = useSendPasswordCode();
  const [method, setMethod] = useState<Method>('current');
  const [values, setValues] = useState({ currentPassword: '', code: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
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
    setDone(false);
  };

  function requestCode() {
    setErrors((er) => ({ ...er, code: undefined, form: undefined }));
    sendCode.mutate(undefined, {
      onSuccess: () => {
        setSentAt(Date.now());
        setNow(Date.now());
      },
      onError: (e) => setErrors((er) => ({ ...er, code: apiErrorMessage(e) })),
    });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (method === 'current' && !values.currentPassword) next.currentPassword = 'Enter your current password';
    if (method === 'code' && !/^\d{6}$/.test(values.code.trim())) next.code = 'Enter the 6-digit code';
    if (values.newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters';
    if (values.confirm !== values.newPassword) next.confirm = "The passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const proof = method === 'current' ? { currentPassword: values.currentPassword } : { code: values.code.trim() };
    change.mutate(
      { newPassword: values.newPassword, ...proof },
      {
        onSuccess: () => {
          setDone(true);
          setValues({ currentPassword: '', code: '', newPassword: '', confirm: '' });
          setSentAt(null);
        },
        onError: (err) => {
          const fields = err instanceof ApiError ? err.fields : {};
          setErrors({
            currentPassword: fields.currentPassword,
            code: fields.code,
            newPassword: fields.newPassword,
            form: Object.keys(fields).length ? undefined : apiErrorMessage(err),
          });
        },
      },
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <CardTitle>Change password</CardTitle>
      <Tabs
        label="How to confirm it's you"
        value={method}
        onChange={(m) => {
          setMethod(m);
          setErrors({});
        }}
        tabs={[
          { value: 'current', label: 'Current password' },
          { value: 'code', label: 'Email code' },
        ]}
      />

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {errors.form && <Alert>{errors.form}</Alert>}

        {method === 'current' ? (
          <PasswordField
            id="current-password"
            label="Current password"
            autoComplete="current-password"
            value={values.currentPassword}
            error={errors.currentPassword}
            onChange={set('currentPassword')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-caption text-muted-foreground">
              Forgot your password? We&apos;ll email a 6-digit code to <b className="font-semibold text-foreground">{email}</b>.
            </p>
            <div className="flex flex-wrap items-start gap-2.5">
              <div className="min-w-40 flex-1">
                <FormField
                  id="password-code"
                  label="Code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={values.code}
                  error={errors.code}
                  hint={sentAt ? 'Check your inbox. The code works for 10 minutes.' : undefined}
                  onChange={set('code')}
                />
              </div>
              <Button variant="outline" className="mt-[26px]" loading={sendCode.isPending} disabled={resendIn > 0} onClick={requestCode}>
                {!sendCode.isPending && <Mail aria-hidden className="size-4" />}
                {sentAt ? (resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code') : 'Send code'}
              </Button>
            </div>
          </div>
        )}

        <PasswordField
          id="new-password"
          label="New password"
          aside="At least 8 characters"
          autoComplete="new-password"
          value={values.newPassword}
          error={errors.newPassword}
          onChange={set('newPassword')}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          value={values.confirm}
          error={errors.confirm}
          onChange={set('confirm')}
        />

        {done && (
          <Alert tone="success" icon={Check}>
            Password changed. Other devices were signed out; you stay logged in here.
          </Alert>
        )}
        <Button type="submit" className="self-start" loading={change.isPending}>
          Change password
        </Button>
      </form>
    </Card>
  );
}
