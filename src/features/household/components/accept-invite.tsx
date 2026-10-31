'use client';

import { CircleAlert, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, buttonStyles } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs } from '@/components/ui/tabs';
import { useLogout, useMe } from '@/features/auth/api';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { ApiError } from '@/lib/api-client';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatLongDate } from '@/lib/format';
import type { InvitePreview } from '@/types/api';
import { useAcceptInvite, useInvitePreview } from '../api';

const UNUSABLE: Record<Exclude<InvitePreview['status'], 'PENDING'>, string> = {
  EXPIRED: 'This invite has expired. Ask the head of the family to send a new one.',
  REVOKED: 'This invite was cancelled by the head of the family.',
  ACCEPTED: 'This invite has already been used.',
};

function Heading({ preview }: { preview: InvitePreview }) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <span className="flex size-12 items-center justify-center rounded-card bg-primary-subtle text-accent">
        <Users aria-hidden className="size-6" />
      </span>
      <h1 className="text-title font-bold tracking-tight">Join {preview.familyName}</h1>
      <p className="text-body text-muted-foreground">
        {preview.inviterName} invited <b className="font-semibold text-foreground">{preview.email}</b> to share the family
        budget and bills.
      </p>
    </div>
  );
}

/**
 * 1. Invalid invite → the reason. 2. Logged out → create an account (email fixed) or log in.
 * 3. Logged in → Join; if the API says it would archive the user's own household, confirm first.
 */
export function AcceptInvite({ token, hasSession }: { token: string; hasSession: boolean }) {
  const router = useRouter();
  const preview = useInvitePreview(token);
  const [loggedIn, setLoggedIn] = useState(hasSession);
  // Only ask for the session when a cookie exists: a 401 here would redirect to /login and lose the invite.
  const me = useMe({ enabled: loggedIn });
  const accept = useAcceptInvite(token);
  const logout = useLogout();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const done = () => router.replace('/dashboard');

  if (preview.isPending) {
    return (
      <div className="flex justify-center py-16 text-accent">
        <Spinner className="size-6" />
      </div>
    );
  }
  if (preview.error || !preview.data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-title font-bold">Invite not found</h1>
        <Alert>{apiErrorMessage(preview.error)}</Alert>
        <Link href="/login" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
          Go to HomeWise
        </Link>
      </div>
    );
  }

  const invite = preview.data;
  if (invite.status !== 'PENDING') {
    return (
      <div className="flex flex-col gap-6">
        <Heading preview={invite} />
        <Alert icon={CircleAlert}>{UNUSABLE[invite.status]}</Alert>
        <Link href={loggedIn ? '/dashboard' : '/login'} className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
          {loggedIn ? 'Go to dashboard' : 'Log in'}
        </Link>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="flex flex-col gap-6">
        <Heading preview={invite} />
        <Tabs
          label="Account"
          value={mode}
          onChange={setMode}
          tabs={[
            { value: 'register', label: 'Create account' },
            { value: 'login', label: 'I have an account' },
          ]}
        />
        {mode === 'register' ? (
          <RegisterForm key="register" embedded invite={{ token, email: invite.email, name: invite.name }} onRegistered={done} />
        ) : (
          <LoginForm key="login" embedded defaultEmail={invite.email} onLoggedIn={() => setLoggedIn(true)} />
        )}
        <p className="text-caption text-muted-foreground">The link works until {formatLongDate(invite.expiresAt.slice(0, 10))}.</p>
      </div>
    );
  }

  if (!me.data) {
    return (
      <div className="flex justify-center py-16 text-accent">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (me.data.user.email !== invite.email) {
    return (
      <div className="flex flex-col gap-6">
        <Heading preview={invite} />
        <Alert icon={CircleAlert}>
          This invite is for {invite.email}, but you&apos;re logged in as {me.data.user.email}. Log out and continue with
          the invited email.
        </Alert>
        <Button size="lg" variant="outline" loading={logout.isPending} onClick={() => logout.mutate(undefined, { onSettled: () => setLoggedIn(false) })}>
          Log out
        </Button>
      </div>
    );
  }

  function join(confirmArchivePersonal?: boolean) {
    accept.mutate(
      { confirmArchivePersonal },
      {
        onSuccess: done,
        onError: (err) => {
          if (err instanceof ApiError && err.code === 'CONFIRM_ARCHIVE_PERSONAL') setConfirmMessage(err.message);
        },
      },
    );
  }

  const blocked = accept.error instanceof ApiError && accept.error.code !== 'CONFIRM_ARCHIVE_PERSONAL';

  return (
    <div className="flex flex-col gap-6">
      <Heading preview={invite} />
      {blocked && <Alert>{apiErrorMessage(accept.error)}</Alert>}
      {confirmMessage ? (
        <>
          <Alert tone="warning" icon={CircleAlert}>
            {confirmMessage}
          </Alert>
          <div className="flex gap-2.5">
            <Link href="/dashboard" className={buttonStyles({ variant: 'secondary', size: 'lg', className: 'flex-1' })}>
              Cancel
            </Link>
            <Button size="lg" className="flex-[2]" loading={accept.isPending} onClick={() => join(true)}>
              Archive and join
            </Button>
          </div>
        </>
      ) : (
        <Button size="lg" className="w-full" loading={accept.isPending} disabled={blocked} onClick={() => join()}>
          Join {invite.familyName}
        </Button>
      )}
      <p className="text-caption text-muted-foreground">Logged in as {me.data.user.email}.</p>
    </div>
  );
}
