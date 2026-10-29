'use client';

import { BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';
import type { AppNotification } from '@/types/api';
import { useMarkAllRead, useMarkRead, useNotifications } from '../api';

/** Unread items are bold with a dot; clicking one marks it read and opens its bill or budget. */
export function NotificationList({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const { data, isPending } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  function open(n: AppNotification) {
    if (!n.readAt) markRead.mutate(n.id);
    onNavigate();
    if (n.link) router.push(n.link);
  }

  return (
    <section aria-labelledby="notifications-title" className="flex min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <h3 id="notifications-title" className="text-body font-bold">
          Notifications
        </h3>
        {Boolean(data?.unreadCount) && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            Mark all read
          </Button>
        )}
      </div>
      {isPending ? (
        <div className="flex justify-center py-8 text-accent">
          <Spinner />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-caption text-muted-foreground">
          <BellOff aria-hidden className="size-5" />
          You&apos;re all caught up.
        </div>
      ) : (
        <ul className="flex flex-col overflow-y-auto pb-2">
          {data.items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => open(n)}
                className={cn('flex w-full gap-2.5 px-4 py-2.5 text-left hover:bg-neutral', !n.readAt && 'bg-primary-subtle/60')}
              >
                <span
                  aria-hidden
                  className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-accent')}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={cn('text-caption', n.readAt ? 'font-medium' : 'font-bold')}>
                    {n.title}
                    {!n.readAt && <span className="sr-only"> (unread)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                  <span className="text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
