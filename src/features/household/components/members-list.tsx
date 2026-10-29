'use client';

import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/modal';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatLongDate } from '@/lib/format';
import type { Member } from '@/types/api';
import { useRemoveMember } from '../api';

type MembersListProps = { members: Member[]; userId: string; canRemove: boolean };

export function MembersList({ members, userId, canRemove }: MembersListProps) {
  const remove = useRemoveMember();
  const [removing, setRemoving] = useState<Member | null>(null);

  return (
    <Card className="p-0">
      <div className="px-6 pt-6">
        <CardTitle>
          Members <span className="font-semibold text-muted-foreground">{members.length}</span>
        </CardTitle>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {members.map((m) => (
          <li key={m.userId} className="flex flex-wrap items-center gap-3 px-6 py-4">
            <Avatar name={m.name} src={m.avatarUrl} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="flex flex-wrap items-center gap-2 font-semibold">
                {m.name}
                {m.userId === userId && <span className="font-normal text-muted-foreground">(you)</span>}
                <Badge shape="tag" tone={m.role === 'HEAD' ? 'brand' : 'brand-subtle'}>
                  {m.role}
                </Badge>
              </span>
              <span className="truncate text-caption text-muted-foreground">
                {m.email} · joined {formatLongDate(m.joinedAt.slice(0, 10))}
              </span>
            </div>
            {canRemove && m.role !== 'HEAD' && (
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-subtle" onClick={() => setRemoving(m)}>
                <UserMinus aria-hidden className="size-4" />
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.name ?? 'member'}?`}
        confirmLabel="Remove member"
        loading={remove.isPending}
        onConfirm={() => removing && remove.mutate(removing.userId, { onSuccess: () => setRemoving(null) })}
      >
        They lose access straight away. Their spending stays in your history, and any unpaid bills they were paying move
        to you.
        {remove.isError && <span className="mt-2 block text-danger">{apiErrorMessage(remove.error)}</span>}
      </ConfirmDialog>
    </Card>
  );
}
