'use client';

import { Bell as BellIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useNotifications } from '../api';
import { DuePanel } from './due-panel';
import { NotificationList } from './notification-list';

type BellProps = {
  /** 'sidebar': opens to the right of the sidebar, bottom-aligned. 'screen': spans the screen under the mobile top bar. */
  placement?: 'sidebar' | 'screen';
  className?: string;
  buttonClassName?: string;
};

/** Bell with the unread count (capped at 9+). Opens bills due soon / overdue and the notification list. */
export function Bell({ placement = 'sidebar', className, buttonClassName }: BellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { data } = useNotifications();
  const unread = data?.unreadCount ?? 0;

  // Close on Escape or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className={cn('relative flex size-10 items-center justify-center rounded-control text-white hover:bg-white/15', buttonClassName)}
      >
        <BellIcon aria-hidden className="size-5" />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-sidebar bg-danger px-1 text-[11px] font-extrabold text-danger-foreground"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          className={cn(
            'z-40 flex max-h-[min(560px,80vh)] flex-col overflow-hidden rounded-card border border-border bg-card text-foreground shadow-xl',
            // Beside the 240px sidebar (w-60), lined up with its bottom.
            placement === 'sidebar' ? 'fixed bottom-6 left-64 w-[380px]' : 'fixed inset-x-4 top-[72px]',
          )}
        >
          <DuePanel onNavigate={() => setOpen(false)} />
          <NotificationList onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
