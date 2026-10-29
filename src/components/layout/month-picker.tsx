'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addMonths } from '@/lib/dates';
import { formatMonth } from '@/lib/format';

type MonthPickerProps = {
  month: string;
  onChange: (month: string) => void;
  /** Latest month that can be selected, e.g. the current month. */
  max?: string;
};

export function MonthPicker({ month, onChange, max }: MonthPickerProps) {
  const atMax = max !== undefined && month >= max;

  return (
    <div className="flex items-center gap-1 rounded-control border-[1.5px] border-border bg-card p-0.5">
      <Button variant="ghost" size="icon" className="size-9" aria-label="Previous month" onClick={() => onChange(addMonths(month, -1))}>
        <ChevronLeft aria-hidden className="size-[18px]" />
      </Button>
      <span className="min-w-32 text-center text-caption font-semibold text-foreground" aria-live="polite">
        {formatMonth(month)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Next month"
        disabled={atMax}
        onClick={() => onChange(addMonths(month, 1))}
      >
        <ChevronRight aria-hidden className="size-[18px]" />
      </Button>
    </div>
  );
}
