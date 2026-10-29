'use client';

import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/features/household/components/member-avatar';
import { cn } from '@/lib/cn';
import { formatDate, formatINR } from '@/lib/format';
import type { Occurrence } from '@/types/api';
import { FREQUENCY_LABELS, type DisplayStatus } from '@/types/constants';
import { BillIcon } from './bill-icon';
import { StatusBadge } from './status-badge';

const GROUPS: { status: DisplayStatus; title: string; color: string }[] = [
  { status: 'OVERDUE', title: 'OVERDUE', color: 'text-danger' },
  { status: 'DUE_SOON', title: 'DUE SOON', color: 'text-warning' },
  { status: 'UPCOMING', title: 'UPCOMING', color: 'text-foreground' },
  { status: 'PAID', title: 'PAID', color: 'text-success' },
];

export type Viewer = { userId: string; isHead: boolean };

/** "Mark paid" shows only for the person responsible or the head; the API checks again. */
export const canPay = (o: Occurrence, viewer: Viewer) =>
  o.status === 'UNPAID' && (viewer.isHead || o.responsibleUserId === viewer.userId);

function occurrenceMeta(o: Occurrence) {
  if (o.status === 'PAID') {
    return `Paid ${o.paidAt ? formatDate(o.paidAt) : ''}${o.receiptCount > 0 ? ' · receipt attached' : ''}`;
  }
  const due = o.displayStatus === 'OVERDUE' ? `Was due ${formatDate(o.dueDate)}` : `Due ${formatDate(o.dueDate)}`;
  return `${due} · ${FREQUENCY_LABELS[o.bill.frequency]}${o.bill.amountType === 'VARIABLE' ? ' · estimate' : ''}`;
}

type BillListProps = {
  occurrences: Occurrence[];
  viewer: Viewer;
  selectedId?: string;
  onSelect: (id: string) => void;
  onUndo: (occurrence: Occurrence) => void;
};

export function BillList({ occurrences, viewer, selectedId, onSelect, onUndo }: BillListProps) {
  return (
    <div className="flex flex-col gap-[22px]">
      {GROUPS.map((group) => {
        const rows = occurrences.filter((o) => o.displayStatus === group.status);
        if (rows.length === 0) return null;
        return (
          <section key={group.status} aria-labelledby={`group-${group.status}`} className="flex flex-col gap-2.5">
            <h2 id={`group-${group.status}`} className={cn('flex items-center gap-2 text-caption font-extrabold tracking-[0.06em]', group.color)}>
              {group.title}
              <span className="font-semibold text-muted-foreground">{rows.length}</span>
            </h2>
            {rows.map((o) => (
              <BillRow
                key={o.id}
                occurrence={o}
                viewer={viewer}
                selected={o.id === selectedId}
                onSelect={() => onSelect(o.id)}
                onUndo={() => onUndo(o)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

type BillRowProps = {
  occurrence: Occurrence;
  viewer: Viewer;
  selected: boolean;
  onSelect: () => void;
  onUndo: () => void;
};

function BillRow({ occurrence: o, viewer, selected, onSelect, onUndo }: BillRowProps) {
  const paid = o.status === 'PAID';
  const person = paid ? (o.paidBy?.name ?? 'Former member') : o.responsibleName;
  const personId = paid ? o.paidBy?.id : o.responsibleUserId;
  const personLabel = paid ? 'Paid by' : o.isAssignedToHead ? 'Head' : 'Responsible';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer flex-wrap items-center gap-3.5 rounded-[14px] px-4 py-3.5 transition-colors',
        selected ? 'border-[1.5px] border-accent bg-primary-subtle' : 'border border-border bg-card hover:bg-neutral/60',
      )}
    >
      <BillIcon categoryName={o.category.name} billName={o.bill.name} />
      <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-[3px]">
        {/* The real control for keyboard and screen-reader users; the row click is a shortcut. */}
        <button type="button" onClick={(e) => (e.stopPropagation(), onSelect())} className="text-left text-body font-bold hover:underline">
          {o.bill.name}
        </button>
        <span className="text-caption text-muted-foreground">{occurrenceMeta(o)}</span>
      </div>
      <div className="flex flex-[0_1_180px] items-center gap-2">
        <MemberAvatar userId={personId} name={person} className="size-7 text-[11px] font-extrabold" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-caption font-semibold">
            {person}
            {personId === viewer.userId && ' (you)'}
          </span>
          <span className="text-[11px] text-muted-foreground">{personLabel}</span>
        </div>
      </div>
      <div className="flex min-w-24 flex-col items-end gap-1.5">
        <span className="text-body font-extrabold">{formatINR(paid ? (o.paidAmount ?? o.amountDue) : o.amountDue)}</span>
        <StatusBadge status={o.displayStatus} />
      </div>
      {canPay(o, viewer) ? (
        <Button size="sm" className="h-10 min-w-[92px]" aria-label={`Mark paid: ${o.bill.name}`} onClick={(e) => (e.stopPropagation(), onSelect())}>
          Mark paid
        </Button>
      ) : paid && viewer.isHead ? (
        <Button
          variant="secondary"
          size="sm"
          className="h-10 min-w-[92px] text-muted-foreground"
          aria-label={`Undo payment for ${o.bill.name}`}
          onClick={(e) => (e.stopPropagation(), onUndo())}
        >
          Undo
        </Button>
      ) : (
        // Keeps amounts aligned with rows that have an action.
        <span aria-hidden className="hidden w-[92px] sm:block" />
      )}
    </div>
  );
}
