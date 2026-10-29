'use client';

import Link from 'next/link';
import { useMe } from '@/features/auth/api';
import { useOccurrences } from '@/features/bills/api';
import { StatusBadge } from '@/features/bills/components/status-badge';
import { addDays, todayIST } from '@/lib/dates';
import { formatDate, formatINR } from '@/lib/format';

/**
 * Live "Due soon / Overdue": a query of unpaid occurrences, not built from notifications, so paying a
 * bill clears it at once. Members see the bills they're responsible for; the head sees all of them.
 */
export function DuePanel({ onNavigate }: { onNavigate: () => void }) {
  const { data: session } = useMe();
  const { data } = useOccurrences({ status: 'UNPAID', to: addDays(todayIST(), 7) });
  const isHead = session?.role === 'HEAD';
  const due = (data ?? []).filter(
    (o) =>
      (o.displayStatus === 'OVERDUE' || o.displayStatus === 'DUE_SOON') &&
      (isHead || o.responsibleUserId === session?.user.id),
  );
  if (due.length === 0) return null;

  return (
    <section aria-labelledby="due-panel-title" className="border-b border-border px-4 py-3">
      <h3 id="due-panel-title" className="mb-1.5 text-xs font-extrabold tracking-[0.06em] text-muted-foreground">
        DUE SOON / OVERDUE
      </h3>
      <ul className="flex flex-col">
        {due.slice(0, 4).map((o) => (
          <li key={o.id}>
            <Link href="/bills" onClick={onNavigate} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-neutral">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-caption font-semibold">{o.bill.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatINR(o.amountDue)} · {o.displayStatus === 'OVERDUE' ? 'was due' : 'due'} {formatDate(o.dueDate)}
                  {isHead && ` · ${o.responsibleName}`}
                </span>
              </span>
              <StatusBadge status={o.displayStatus} />
            </Link>
          </li>
        ))}
      </ul>
      {due.length > 4 && (
        <Link href="/bills" onClick={onNavigate} className="mt-1 block px-1.5 text-xs font-bold text-accent hover:underline">
          {due.length - 4} more
        </Link>
      )}
    </section>
  );
}
