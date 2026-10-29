'use client';

import { TriangleAlert, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { AffixInput } from '@/components/ui/affix-input';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { ConfirmDialog } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useSpendingEntry } from '@/features/spending/api';
import { AttachmentViewer } from '@/features/spending/components/attachment-viewer';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatDate, formatINR, formatLongDate } from '@/lib/format';
import type { FailedFile, Member, Occurrence } from '@/types/api';
import { useOccurrences, useUnpayOccurrence, useUpdateOccurrence } from '../api';
import { canPay, type Viewer } from './bill-list';
import { PayForm } from './pay-dialog';
import { StatusBadge } from './status-badge';

type OccurrenceDetailProps = {
  occurrence: Occurrence;
  viewer: Viewer;
  members: Member[];
  onCancel: () => void;
};

export function OccurrenceDetail({ occurrence: o, viewer, members, onCancel }: OccurrenceDetailProps) {
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([]);
  const editable = viewer.isHead && o.status === 'UNPAID';

  return (
    <div className="flex flex-col gap-5">
      {failedFiles.length > 0 && (
        <Alert tone="warning" icon={TriangleAlert}>
          Payment saved, but the receipt didn&apos;t upload. Add it from the spending entry.
        </Alert>
      )}

      {o.status === 'PAID' ? (
        <PaidSummary occurrence={o} viewer={viewer} />
      ) : canPay(o, viewer) ? (
        <PayForm key={`${o.id}-${o.amountDue}`} occurrence={o} onPaid={setFailedFiles} onCancel={onCancel} />
      ) : (
        <Alert tone="brand">
          {o.responsibleName} is responsible for this bill this time. They or the head can mark it paid.
        </Alert>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-3.5">
        <span className="text-xs font-extrabold tracking-[0.06em] text-muted-foreground">RESPONSIBLE THIS TIME</span>
        <Responsible occurrence={o} viewer={viewer} members={members} editable={editable} />
        {editable && <AmountDue occurrence={o} />}
      </div>

      <History occurrence={o} />
    </div>
  );
}

function PaidSummary({ occurrence: o, viewer }: { occurrence: Occurrence; viewer: Viewer }) {
  const entry = useSpendingEntry(o.receiptCount > 0 ? o.transactionId : null);
  const unpay = useUnpayOccurrence();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
        <dt className="text-muted-foreground">Paid</dt>
        <dd className="font-bold">{formatINR(o.paidAmount ?? o.amountDue)}</dd>
        <dt className="text-muted-foreground">Paid on</dt>
        <dd>{o.paidAt ? formatLongDate(o.paidAt) : '—'}</dd>
        <dt className="text-muted-foreground">Paid by</dt>
        <dd>{o.paidBy?.name ?? 'Former member'}</dd>
        {o.paidAmount && o.paidAmount !== o.amountDue && (
          <>
            <dt className="text-muted-foreground">Amount due</dt>
            <dd>{formatINR(o.amountDue)}</dd>
          </>
        )}
      </dl>

      {o.receiptCount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-caption font-semibold">Receipt</span>
          {entry.data ? (
            <AttachmentViewer attachments={entry.data.attachments} canRemove={false} />
          ) : (
            <Spinner className="text-accent" />
          )}
        </div>
      )}

      {viewer.isHead && (
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          <Undo2 aria-hidden className="size-4" />
          Undo payment
        </Button>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Undo this payment?"
        confirmLabel="Undo payment"
        loading={unpay.isPending}
        onConfirm={() => unpay.mutate(o.id, { onSuccess: () => setConfirming(false) })}
      >
        {o.bill.name} goes back to unpaid, and its {formatINR(o.paidAmount ?? o.amountDue)} spending entry
        {o.receiptCount > 0 ? ' and receipt are' : ' is'} removed.
        {unpay.isError && <span className="mt-2 block text-danger">{apiErrorMessage(unpay.error)}</span>}
      </ConfirmDialog>
    </div>
  );
}

type ResponsibleProps = { occurrence: Occurrence; viewer: Viewer; members: Member[]; editable: boolean };

function Responsible({ occurrence: o, viewer, members, editable }: ResponsibleProps) {
  const update = useUpdateOccurrence();
  const [editing, setEditing] = useState(false);
  const head = members.find((m) => m.role === 'HEAD');
  // '' means "the head" (assignee null), matching how the API stores it.
  const [value, setValue] = useState(o.isAssignedToHead ? '' : (o.assigneeId ?? ''));

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={`assignee-${o.id}`} className="sr-only">
          Who pays {o.bill.name} this time
        </label>
        <Select id={`assignee-${o.id}`} value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">{head ? `${head.name} (head)` : 'Head'}</option>
          {members
            .filter((m) => m.role !== 'HEAD')
            .map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
        </Select>
        <FieldError message={update.isError ? apiErrorMessage(update.error) : undefined} />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={update.isPending}
            onClick={() => update.mutate({ id: o.id, assigneeId: value || null }, { onSuccess: () => setEditing(false) })}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={o.responsibleName} className="size-8 text-xs font-extrabold" />
      <span className="flex-1 text-body font-semibold">
        {o.responsibleName}
        {o.responsibleUserId === viewer.userId && ' (you)'}
      </span>
      {editable && members.length > 1 && (
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Reassign
        </Button>
      )}
    </div>
  );
}

function AmountDue({ occurrence: o }: { occurrence: Occurrence }) {
  const update = useUpdateOccurrence();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Number(o.amountDue)));

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 text-body">
        <span className="text-muted-foreground">
          Amount due <span className="font-semibold text-foreground">{formatINR(o.amountDue)}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`amount-due-${o.id}`} className="text-caption font-semibold">
        Amount due this time
      </label>
      <AffixInput id={`amount-due-${o.id}`} prefix="₹" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
      <FieldError message={update.isError ? apiErrorMessage(update.error) : undefined} />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          loading={update.isPending}
          onClick={() =>
            update.mutate({ id: o.id, amountDue: value.replace(/,/g, '').trim() }, { onSuccess: () => setEditing(false) })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/** Other periods of the same bill, newest first. */
function History({ occurrence }: { occurrence: Occurrence }) {
  const { data } = useOccurrences({ billId: occurrence.bill.id });
  const others = (data ?? []).filter((o) => o.id !== occurrence.id).reverse().slice(0, 6);
  if (others.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3.5">
      <span className="text-xs font-extrabold tracking-[0.06em] text-muted-foreground">HISTORY</span>
      <ul className="flex flex-col gap-2">
        {others.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 text-caption">
            <span className="text-muted-foreground">Due {formatDate(o.dueDate)}</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{formatINR(o.paidAmount ?? o.amountDue)}</span>
              <StatusBadge status={o.displayStatus} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
