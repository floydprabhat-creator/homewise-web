'use client';

import { Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { formatDate, formatINR } from '@/lib/format';
import type { SpendingEntry } from '@/types/api';
import { BUCKET_INFO } from '@/types/constants';

type SpendingTableProps = {
  items: SpendingEntry[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function SpendingTable({ items, selectedId, onSelect }: SpendingTableProps) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-border bg-card">
      <table className="w-full border-collapse text-sm md:min-w-[640px]">
        <thead>
          <tr className="text-left text-xs tracking-[0.04em] text-muted-foreground">
            <th scope="col" className="border-b border-border px-[18px] py-3.5 font-bold">DATE</th>
            <th scope="col" className="border-b border-border px-3 py-3.5 font-bold">ENTRY</th>
            <th scope="col" className="hidden border-b border-border px-3 py-3.5 font-bold md:table-cell">RECORDED BY</th>
            <th scope="col" className="hidden border-b border-border px-3 py-3.5 font-bold md:table-cell">FILES</th>
            <th scope="col" className="border-b border-border px-[18px] py-3.5 text-right font-bold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((entry) => (
            <tr
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className={cn(
                'cursor-pointer transition-colors [&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0',
                entry.id === selectedId ? 'bg-primary-subtle' : 'hover:bg-neutral/60',
              )}
            >
              <td className="py-3.5 pr-2 pl-4 align-top whitespace-nowrap text-muted-foreground md:px-[18px] md:align-middle">{formatDate(entry.date)}</td>
              <td className="px-3 py-3">
                <div className="flex flex-col gap-[3px]">
                  {/* The real control for keyboard and screen-reader users; the row click is a shortcut. */}
                  <button type="button" onClick={(e) => (e.stopPropagation(), onSelect(entry.id))} className="text-left font-semibold hover:underline">
                    {entry.note ?? entry.category.name}
                  </button>
                  <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span aria-hidden className={cn('size-2 shrink-0 rounded-full', BUCKET_INFO[entry.category.bucket].dot)} />
                    {entry.category.name}
                    {/* On phones the recorder and files columns are hidden; show them here instead. */}
                    <span className="md:hidden">
                      · {entry.recordedBy.name}
                      {entry.attachmentCount > 0 && (
                        <span className="ml-1 inline-flex items-center gap-0.5 text-accent">
                          <Paperclip aria-hidden className="size-3" />
                          {entry.attachmentCount}
                          <span className="sr-only">{entry.attachmentCount === 1 ? 'file' : 'files'}</span>
                        </span>
                      )}
                    </span>
                    {entry.isBillPayment && (
                      <Badge shape="tag" tone="neutral" className="ml-1 h-5 px-2 text-[11px]">
                        Bill payment
                      </Badge>
                    )}
                  </span>
                </div>
              </td>
              <td className="hidden px-3 py-3 whitespace-nowrap md:table-cell">
                {entry.recordedBy.name}
                {entry.recordedBy.isFormerMember && <span className="block text-xs text-muted-foreground">former member</span>}
              </td>
              <td className="hidden px-3 py-3 text-accent md:table-cell">
                {entry.attachmentCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-caption font-semibold">
                    <Paperclip aria-hidden className="size-4" />
                    {entry.attachmentCount}
                    <span className="sr-only">{entry.attachmentCount === 1 ? 'file' : 'files'}</span>
                  </span>
                )}
              </td>
              <td className="py-3.5 pr-4 pl-2 text-right align-top font-bold whitespace-nowrap md:px-[18px] md:align-middle">{formatINR(entry.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
