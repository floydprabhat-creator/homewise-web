'use client';

import { Plus, ReceiptText, X } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { Tabs } from '@/components/ui/tabs';
import { useMe } from '@/features/auth/api';
import { useHousehold } from '@/features/household/api';
import { addDays, currentMonthIST, todayIST } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatDate, formatINR } from '@/lib/format';
import type { Bill, Occurrence } from '@/types/api';
import { useOccurrences, useUnpayOccurrence } from '../api';
import { BillForm } from './bill-form';
import { BillList, canPay, type Viewer } from './bill-list';
import { ManageBills } from './manage-bills';
import { OccurrenceDetail } from './occurrence-detail';

type Tab = 'due' | 'manage';
type Panel = { mode: 'occurrence'; id: string } | { mode: 'create' } | { mode: 'edit'; bill: Bill } | null;

/** Overdue (any age) plus everything due from the 1st of this month to 60 days ahead. */
function dueListQuery() {
  return { from: `${currentMonthIST()}-01`, to: addDays(todayIST(), 60), includeOverdue: true };
}

/** "₹4,200 still due this month · 1 overdue", added up in paise so it never drifts. */
function summary(items: Occurrence[]) {
  const month = currentMonthIST();
  const unpaid = items.filter((o) => o.status === 'UNPAID');
  const dueThisMonth = unpaid
    .filter((o) => o.dueDate.startsWith(month))
    .reduce((paise, o) => paise + Math.round(Number(o.amountDue) * 100), 0);
  const overdue = unpaid.filter((o) => o.displayStatus === 'OVERDUE').length;
  const parts = [dueThisMonth > 0 ? `${formatINR(dueThisMonth / 100)} still due this month` : 'Nothing left to pay this month'];
  if (overdue > 0) parts.push(`${overdue} overdue`);
  return parts.join(' · ');
}

export function BillsView() {
  const { data: session } = useMe();
  const { data: household } = useHousehold();
  const [tab, setTab] = useState<Tab>('due');
  const [panel, setPanel] = useState<Panel>(null);
  const [undoing, setUndoing] = useState<Occurrence | null>(null);
  const [query] = useState(dueListQuery);
  const { data: occurrences, error } = useOccurrences(query);
  const unpay = useUnpayOccurrence();

  const viewer: Viewer | null = session ? { userId: session.user.id, isHead: session.role === 'HEAD' } : null;
  const members = household?.members ?? [];
  const selected = panel?.mode === 'occurrence' ? occurrences?.find((o) => o.id === panel.id) : undefined;

  const panelTitle =
    panel?.mode === 'create'
      ? 'New bill'
      : panel?.mode === 'edit'
        ? `Edit ${panel.bill.name}`
        : selected && viewer && canPay(selected, viewer)
          ? `Mark ${selected.bill.name} paid`
          : (selected?.bill.name ?? 'Bill');

  return (
    <>
      <PageHeader
        title="Bills"
        description={occurrences ? summary(occurrences) : undefined}
        actions={
          viewer?.isHead && (
            <>
              <Tabs
                label="Bills view"
                value={tab}
                onChange={(t) => {
                  setTab(t);
                  setPanel(null);
                }}
                tabs={[
                  { value: 'due', label: 'Due list' },
                  { value: 'manage', label: 'Manage bills' },
                ]}
              />
              <Button onClick={() => setPanel({ mode: 'create' })}>
                <Plus aria-hidden className="size-[18px]" strokeWidth={2.4} />
                New bill
              </Button>
            </>
          )
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <section aria-label={tab === 'due' ? 'Due list' : 'Manage bills'} className="flex min-w-0 flex-[999_1_560px] flex-col gap-3.5">
          {tab === 'manage' ? (
            <ManageBills
              selectedId={panel?.mode === 'edit' ? panel.bill.id : undefined}
              onEdit={(bill) => setPanel({ mode: 'edit', bill })}
              onCreate={() => setPanel({ mode: 'create' })}
            />
          ) : error ? (
            <Alert>{apiErrorMessage(error)}</Alert>
          ) : !occurrences || !viewer ? (
            <div className="flex justify-center py-16 text-accent">
              <Spinner className="size-6" />
            </div>
          ) : occurrences.length === 0 ? (
            <div className="rounded-[14px] border border-border bg-card">
              <EmptyState
                icon={ReceiptText}
                title="No bills due"
                description={
                  viewer.isHead
                    ? 'Add rent, electricity, internet and other bills once. Each month gets its own due date and payer.'
                    : "The head of your household hasn't added any bills yet."
                }
                action={viewer.isHead && <Button onClick={() => setPanel({ mode: 'create' })}>New bill</Button>}
              />
            </div>
          ) : (
            <BillList
              occurrences={occurrences}
              viewer={viewer}
              selectedId={selected?.id}
              onSelect={(id) => setPanel({ mode: 'occurrence', id })}
              onUndo={setUndoing}
            />
          )}
        </section>

        {panel && viewer && (
          // First on small screens so it opens where the user is looking; beside the list from lg.
          <aside
            aria-label={panelTitle}
            className="order-first flex min-w-0 flex-[1_1_340px] flex-col gap-4 rounded-2xl border border-border bg-card p-[22px] lg:sticky lg:top-6 lg:order-none"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex flex-col gap-1">
                <h2 className="text-section font-extrabold">{panelTitle}</h2>
                {selected && (
                  <span className="text-caption text-muted-foreground">
                    Due {formatDate(selected.dueDate)} · {selected.bill.amountType === 'VARIABLE' ? 'estimate ' : ''}
                    {formatINR(selected.amountDue)}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Close" onClick={() => setPanel(null)}>
                <X aria-hidden className="size-[18px]" />
              </Button>
            </div>

            {panel.mode === 'occurrence' &&
              (selected ? (
                <OccurrenceDetail key={selected.id} occurrence={selected} viewer={viewer} members={members} onCancel={() => setPanel(null)} />
              ) : (
                <p className="text-body text-muted-foreground">This bill is no longer in the list.</p>
              ))}
            {(panel.mode === 'create' || panel.mode === 'edit') && (
              <BillForm
                key={panel.mode === 'edit' ? panel.bill.id : 'create'}
                bill={panel.mode === 'edit' ? panel.bill : undefined}
                members={members}
                onSaved={() => setPanel(null)}
                onCancel={() => setPanel(null)}
              />
            )}
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(undoing)}
        onClose={() => setUndoing(null)}
        title="Undo this payment?"
        confirmLabel="Undo payment"
        loading={unpay.isPending}
        onConfirm={() => undoing && unpay.mutate(undoing.id, { onSuccess: () => setUndoing(null) })}
      >
        {undoing && (
          <>
            {undoing.bill.name} goes back to unpaid, and its {formatINR(undoing.paidAmount ?? undoing.amountDue)} spending
            entry{undoing.receiptCount > 0 ? ' and receipt are' : ' is'} removed.
          </>
        )}
        {unpay.isError && <span className="mt-2 block text-danger">{apiErrorMessage(unpay.error)}</span>}
      </ConfirmDialog>
    </>
  );
}
