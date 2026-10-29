'use client';

import { Archive, Pencil, ReceiptText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatDate, formatINR } from '@/lib/format';
import type { Bill } from '@/types/api';
import { FREQUENCY_LABELS } from '@/types/constants';
import { useBills, useDeleteBill, useUpdateBill } from '../api';
import { BillIcon } from './bill-icon';

type ManageBillsProps = {
  selectedId?: string;
  onEdit: (bill: Bill) => void;
  onCreate: () => void;
};

/** Bill templates, for the head: edit, pause or resume, delete (archived instead when it has paid history). */
export function ManageBills({ selectedId, onEdit, onCreate }: ManageBillsProps) {
  const [showArchived, setShowArchived] = useState(false);
  const { data: bills, error } = useBills({ includeArchived: showArchived });
  const update = useUpdateBill();
  const remove = useDeleteBill();
  const [deleting, setDeleting] = useState<Bill | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <Alert>{apiErrorMessage(error)}</Alert>;
  if (!bills) {
    return (
      <div className="flex justify-center py-16 text-accent">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption text-muted-foreground">
          {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
        </span>
        <Chip pressed={showArchived} onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Hide archived' : 'Show archived'}
        </Chip>
      </div>

      {notice && (
        <Alert tone="brand" icon={Archive}>
          {notice}
        </Alert>
      )}
      {update.isError && <Alert>{apiErrorMessage(update.error)}</Alert>}

      {bills.length === 0 ? (
        <div className="rounded-[14px] border border-border bg-card">
          <EmptyState
            icon={ReceiptText}
            title="No bills yet"
            description="Add rent, electricity, internet and other bills once. HomeWise tracks each month's payment."
            action={<Button onClick={onCreate}>New bill</Button>}
          />
        </div>
      ) : (
        bills.map((bill) => {
                  const archived = bill.status === 'ARCHIVED';
          return (
            <div
              key={bill.id}
              className={cn(
                'flex flex-wrap items-center gap-3.5 rounded-[14px] px-4 py-3.5',
                bill.id === selectedId ? 'border-[1.5px] border-accent bg-primary-subtle' : 'border border-border bg-card',
              )}
            >
              <BillIcon categoryName={bill.category.name} billName={bill.name} />
              <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-[3px]">
                <span className="flex items-center gap-2 text-body font-bold">
                  {bill.name}
                  {bill.status !== 'ACTIVE' && (
                    <Badge shape="tag" tone="neutral" className="h-5 px-2 text-[11px]">
                      {archived ? 'Archived' : 'Paused'}
                    </Badge>
                  )}
                </span>
                <span className="text-caption text-muted-foreground">
                  {bill.category.name} · {FREQUENCY_LABELS[bill.frequency]}
                  {bill.nextDueDate && ` · next due ${formatDate(bill.nextDueDate)}`}
                  {' · '}
                  {bill.defaultAssigneeName ?? 'Head'} pays
                </span>
              </div>
              <span className="min-w-20 text-right text-body font-extrabold">
                {formatINR(bill.amount)}
                {bill.amountType === 'VARIABLE' && <span className="block text-[11px] font-medium text-muted-foreground">estimate</span>}
              </span>
              {!archived && (
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(bill)} aria-label={`Edit ${bill.name}`}>
                    <Pencil aria-hidden className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={update.isPending && update.variables?.id === bill.id}
                    onClick={() => update.mutate({ id: bill.id, status: bill.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' })}
                  >
                    {bill.status === 'PAUSED' ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground hover:bg-danger-subtle hover:text-danger"
                    aria-label={`Delete ${bill.name}`}
                    onClick={() => setDeleting(bill)}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'bill'}?`}
        confirmLabel="Delete bill"
        loading={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: ({ result }) => {
              setNotice(
                result === 'archived'
                  ? `${deleting.name} has paid history, so it was archived instead. Past payments stay in your spending.`
                  : null,
              );
              setDeleting(null);
            },
          })
        }
      >
        Its unpaid bills are removed. If it has been paid before, it&apos;s archived instead so past payments stay in your
        spending.
        {remove.isError && <span className="mt-2 block text-danger">{apiErrorMessage(remove.error)}</span>}
      </ConfirmDialog>
    </div>
  );
}
