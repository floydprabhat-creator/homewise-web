'use client';

import { Plus, ReceiptText, X } from 'lucide-react';
import { useState } from 'react';
import { MonthPicker } from '@/components/layout/month-picker';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { currentMonthIST } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatINR, formatMonth } from '@/lib/format';
import type { FailedFile } from '@/types/api';
import { useSpending, useSpendingEntry } from '../api';
import { useSpendingFilters } from '../use-spending-filters';
import { EntryDetail } from './entry-detail';
import { SpendingFilters } from './spending-filters';
import { SpendingForm } from './spending-form';
import { SpendingTable } from './spending-table';

type Panel =
  | { mode: 'add' }
  | { mode: 'view'; id: string; failedFiles?: FailedFile[] }
  | { mode: 'edit'; id: string }
  | null;

export function SpendingView() {
  const { filters, setFilters } = useSpendingFilters();
  const { data, error, isFetching } = useSpending(filters);
  const [panel, setPanel] = useState<Panel>(null);
  const editing = useSpendingEntry(panel?.mode === 'edit' ? panel.id : null);

  const hasFilters = Boolean(filters.bucket || filters.recordedBy || filters.hasAttachment || filters.q);
  const from = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;
  const lastPage = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const panelTitle = panel?.mode === 'add' ? 'Add spending' : panel?.mode === 'edit' ? 'Edit entry' : 'Entry';

  return (
    <>
      <PageHeader
        title="Spending"
        description={
          data ? `${formatMonth(data.month)} · ${data.total} ${data.total === 1 ? 'entry' : 'entries'} · ${formatINR(data.totalAmount)}` : formatMonth(filters.month)
        }
        actions={
          <>
            <MonthPicker month={filters.month} max={currentMonthIST()} onChange={(month) => setFilters({ month })} />
            <Button onClick={() => setPanel({ mode: 'add' })}>
              <Plus aria-hidden className="size-[18px]" strokeWidth={2.4} />
              Add spending
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-start gap-5">
        <section aria-label="Spending list" className="flex min-w-0 flex-[999_1_560px] flex-col gap-3.5">
          <SpendingFilters filters={filters} onChange={setFilters} />

          {error ? (
            <Alert>{apiErrorMessage(error)}</Alert>
          ) : !data ? (
            <div className="flex justify-center py-16 text-accent">
              <Spinner className="size-6" />
            </div>
          ) : data.items.length === 0 ? (
            <div className="rounded-[14px] border border-border bg-card">
              <EmptyState
                icon={ReceiptText}
                title={hasFilters ? 'No entries match these filters' : `Nothing recorded for ${formatMonth(data.month)}`}
                description={hasFilters ? 'Try another bucket or member, or clear the search.' : 'Add what you spend as you go, with a photo of the bill if you have one.'}
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={() => setFilters({ bucket: undefined, recordedBy: undefined, hasAttachment: undefined, q: undefined })}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => setPanel({ mode: 'add' })}>Add spending</Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
                <SpendingTable
                  items={data.items}
                  selectedId={panel && panel.mode !== 'add' ? panel.id : undefined}
                  onSelect={(id) => setPanel({ mode: 'view', id })}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2.5 text-caption text-muted-foreground">
                <span>
                  Showing {from}–{to} of {data.total}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={data.page <= 1} onClick={() => setFilters({ page: data.page - 1 })}>
                    Previous
                  </Button>
                  <Button variant="secondary" size="sm" disabled={data.page >= lastPage} onClick={() => setFilters({ page: data.page + 1 })}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        {panel && (
          // First on small screens so it opens where the user is looking; beside the list from lg.
          <aside
            aria-label={panelTitle}
            className="order-first flex min-w-0 flex-[1_1_340px] flex-col gap-4 rounded-2xl border border-border bg-card p-[22px] lg:order-none lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-section font-extrabold">{panelTitle}</h2>
              <Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Close" onClick={() => setPanel(null)}>
                <X aria-hidden className="size-[18px]" />
              </Button>
            </div>

            {panel.mode === 'add' && (
              <SpendingForm
                key="add"
                onSaved={(id, failedFiles) => setPanel({ mode: 'view', id, failedFiles })}
                onCancel={() => setPanel(null)}
              />
            )}
            {panel.mode === 'view' && (
              <EntryDetail
                key={panel.id}
                id={panel.id}
                failedFiles={panel.failedFiles}
                onEdit={() => setPanel({ mode: 'edit', id: panel.id })}
                onDeleted={() => setPanel(null)}
              />
            )}
            {panel.mode === 'edit' &&
              (editing.data ? (
                <SpendingForm
                  key={`edit-${panel.id}`}
                  entry={editing.data}
                  onSaved={(id) => setPanel({ mode: 'view', id })}
                  onCancel={() => setPanel({ mode: 'view', id: panel.id })}
                />
              ) : (
                <div className="flex justify-center py-10 text-accent">
                  <Spinner className="size-6" />
                </div>
              ))}
          </aside>
        )}
      </div>
    </>
  );
}
