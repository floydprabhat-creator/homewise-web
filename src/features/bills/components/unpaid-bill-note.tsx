'use client';

import { ReceiptText } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/api';
import { addDays } from '@/lib/dates';
import { formatDate, formatINR } from '@/lib/format';
import type { Occurrence } from '@/types/api';
import { useOccurrences } from '../api';
import { canPay } from './bill-list';

/** How far around the entry's date an unpaid bill counts as "probably this payment". */
const DAYS_BEFORE = 31;
const DAYS_AFTER = 15;

type UnpaidBillNoteProps = {
  categoryId: string;
  /** The spending entry's date. */
  date: string;
  /** Opens the pay form for that bill (rendered by the caller, outside its own <form>). */
  onPay: (occurrence: Occurrence) => void;
};

/**
 * Guards against counting a bill twice: when spending is added in a category that has an unpaid bill
 * due around that date, suggest marking the bill paid instead, which records the spending itself.
 */
export function UnpaidBillNote({ categoryId, date, onPay }: UnpaidBillNoteProps) {
  const { data: session } = useMe();
  const { data } = useOccurrences(
    { status: 'UNPAID', from: addDays(date, -DAYS_BEFORE), to: addDays(date, DAYS_AFTER) },
    { enabled: Boolean(categoryId && date) },
  );
  const bill = data?.find((o) => o.category.id === categoryId);
  if (!bill || !session) return null;

  const viewer = { userId: session.user.id, isHead: session.role === 'HEAD' };
  const summary = `${bill.bill.name} (${formatINR(bill.amountDue)}, ${bill.displayStatus === 'OVERDUE' ? 'was due' : 'due'} ${formatDate(bill.dueDate)}) is still unpaid.`;

  return (
    <Alert tone="brand" icon={ReceiptText} className="text-caption">
      <p>
        {summary}{' '}
        {canPay(bill, viewer)
          ? 'If this is that payment, mark the bill paid instead so it isn’t counted twice.'
          : `If this is that payment, ask ${bill.isAssignedToHead ? `${bill.responsibleName} (the head)` : `${bill.responsibleName} or the head`} to mark the bill paid instead, so it isn’t counted twice.`}
      </p>
      {canPay(bill, viewer) && (
        <Button variant="outline" size="sm" className="mt-2" onClick={() => onPay(bill)}>
          Mark {bill.bill.name} paid
        </Button>
      )}
    </Alert>
  );
}
