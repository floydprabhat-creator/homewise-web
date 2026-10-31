'use client';

import { Check, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/lib/form-errors';
import { useCreateInvite } from '../api';

export function InviteForm() {
  const create = useCreateInvite();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError('Enter a valid email address');
    setError(undefined);
    setSentTo(null);
    create.mutate(
      { email: value, name: name.trim() || undefined },
      {
        onSuccess: () => {
          setSentTo(name.trim() || value);
          setEmail('');
          setName('');
        },
        onError: (err) => setError(apiErrorMessage(err)),
      },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className={cn('min-w-40 flex-1', error && 'mb-6')}>
          <FormField
            id="invite-name"
            label="Name"
            aside="Optional"
            autoComplete="off"
            maxLength={80}
            placeholder="Their name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="min-w-60 flex-[1.5]">
          <FormField
            id="invite-email"
            label="Email"
            type="email"
            autoComplete="off"
            placeholder="name@example.com"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" loading={create.isPending} className={error ? 'mb-6' : undefined}>
          <Send aria-hidden className="size-4" />
          Send invite
        </Button>
      </div>
      {sentTo && (
        <Alert tone="success" icon={Check}>
          Invite sent to {sentTo}. The link works for 7 days.
        </Alert>
      )}
    </form>
  );
}
