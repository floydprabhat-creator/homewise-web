'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BillIcon } from '@/features/bills/components/bill-icon';
import { canPay, type Viewer } from '@/features/bills/components/bill-list';
import { StatusBadge } from '@/features/bills/components/status-badge';
import { formatDate, formatINR } from '@/lib/format';
import type { Occurrence } from '@/types/api';

function meta(o: Occurrence, viewer: Viewer) {
  if (o.status === 'PAID') return `Paid ${o.paidAt ? formatDate(o.paidAt) : ''} · ${o.paidBy?.name ?? 'Former member'}`;
  const due = o.displayStatus === 'OVERDUE' ? `Was due ${formatDate(o.dueDate)}` : `Due ${formatDate(o.dueDate)}`;
  const who = o.responsibleUserId === viewer.userId ? 'You pay' : `${o.responsibleName} pays`;
  return `${due} · ${who}${o.bill.amountType === 'VARIABLE' ? ' · estimate' : ''}`;
}

type UpcomingBillsProps = {
  bills: Occurrence[];
  viewer: Viewer;
  /** Earlier months are read-only. */
  readOnly: boolean;
  onPay: (occurrence: Occurrence) => void;
};

/** Overdue first, then the next 14 days (the API orders them by due date). */
export function UpcomingBills({ bills, viewer, readOnly, onPay }: UpcomingBillsProps) {
  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 py-2">
        <p className="text-caption text-muted-foreground">
          {readOnly ? 'No bills were due this month.' : 'Nothing overdue or due in the next 14 days.'}
        </p>
        {!readOnly && viewer.isHead && (
          <Link href="/bills" className="text-caption font-bold text-accent hover:underline">
            Add a bill
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {bills.map((o) => (
        <li key={o.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
          <BillIcon categoryName={o.category.name} billName={o.bill.name} className="size-10" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-bold">{o.bill.name}</span>
            <span className="truncate text-xs text-muted-foreground">{meta(o, viewer)}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-bold">{formatINR(o.paidAmount ?? o.amountDue)}</span>
            <StatusBadge status={o.displayStatus} />
          </div>
          {!readOnly && canPay(o, viewer) && (
            <Button variant="outline" size="sm" className="px-3 text-xs" aria-label={`Mark ${o.bill.name} paid`} onClick={() => onPay(o)}>
              Mark paid
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
