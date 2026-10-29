import type { ReactNode } from 'react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { BudgetUsage } from '@/types/api';

function Stat({ label, value, caption, tinted, children }: { label: string; value: string; caption: string; tinted?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-[14px] border px-5 py-[18px]',
        tinted ? 'border-primary-soft bg-primary-subtle' : 'border-border bg-card',
      )}
    >
      <span className={cn('text-caption font-semibold', tinted ? 'text-accent' : 'text-muted-foreground')}>{label}</span>
      <span className="text-[26px] font-extrabold tracking-tight">{value}</span>
      {children}
      <span className="text-caption text-muted-foreground">{caption}</span>
    </div>
  );
}

type UsageSummaryProps = { usage: BudgetUsage; budgetCaption?: string };

/** Budget, spent, committed and available. Without a budget, only what was spent. */
export function UsageSummary({ usage, budgetCaption }: UsageSummaryProps) {
  const bills = `${usage.committedCount} unpaid ${usage.committedCount === 1 ? 'bill' : 'bills'} due this month`;
  const overall = usage.state === 'EXCEEDED' ? 'danger' : usage.state === 'WARNING' ? 'warning' : 'primary';

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {usage.totalBudget !== null && (
        <Stat label="Budget" value={formatINR(usage.totalBudget)} caption={budgetCaption ?? 'This month'} />
      )}
      <Stat
        label="Spent"
        value={formatINR(usage.spent)}
        caption={usage.percentUsed === null ? 'No budget to compare with' : `${Math.round(usage.percentUsed)}% of budget`}
      >
        {usage.percentUsed !== null && <ProgressBar value={usage.percentUsed} tone={overall} label="Budget used" className="h-1.5" />}
      </Stat>
      <Stat label="Committed" value={formatINR(usage.committed)} caption={usage.committedCount > 0 ? bills : 'No unpaid bills due this month'} />
      {usage.available !== null && (
        <Stat
          label="Available"
          value={Number(usage.available) < 0 ? `−${formatINR(-Number(usage.available))}` : formatINR(usage.available)}
          caption="After bills already due"
          tinted
        />
      )}
    </div>
  );
}
