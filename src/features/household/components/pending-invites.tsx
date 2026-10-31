'use client';

import { Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatDate } from '@/lib/format';
import type { Invite } from '@/types/api';
import { useResendInvite, useRevokeInvite } from '../api';

/** Pending and expired invites; resending sends a new link and the old one stops working. */
export function PendingInvites({ invites }: { invites: Invite[] }) {
  const resend = useResendInvite();
  const revoke = useRevokeInvite();
  const error = resend.error ?? revoke.error;

  if (invites.length === 0) return <p className="text-caption text-muted-foreground">No pending invites.</p>;

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-border">
        {invites.map((invite) => {
          const expired = invite.status === 'EXPIRED';
          return (
            <li key={invite.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-accent">
                <Mail aria-hidden className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{invite.name ?? invite.email}</span>
                {invite.name && <span className="truncate text-caption text-muted-foreground">{invite.email}</span>}
                <span className="text-caption text-muted-foreground">
                  {expired ? `Expired ${formatDate(invite.expiresAt.slice(0, 10))}` : `Sent ${formatDate(invite.updatedAt.slice(0, 10))} · expires ${formatDate(invite.expiresAt.slice(0, 10))}`}
                </span>
              </div>
              <Badge tone={expired ? 'neutral' : 'warning'} className="h-[22px] px-2.5 text-[11px] font-bold">
                {expired ? 'Expired' : 'Pending'}
              </Badge>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" loading={resend.isPending && resend.variables === invite.id} onClick={() => resend.mutate(invite.id)}>
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-subtle"
                  loading={revoke.isPending && revoke.variables === invite.id}
                  onClick={() => revoke.mutate(invite.id)}
                >
                  Revoke
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <FieldError message={error ? apiErrorMessage(error) : undefined} />
    </div>
  );
}
