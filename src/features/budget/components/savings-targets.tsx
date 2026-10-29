import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { BudgetUsage } from '@/types/api';
import { BUCKET_INFO } from '@/types/constants';

type SavingsTargetsProps = { usage: BudgetUsage };

/** Savings against its share, and each target as "Investments: 2% of 10%". Never shown in red. */
export function SavingsTargets({ usage }: SavingsTargetsProps) {
  const savings = usage.buckets.find((b) => b.bucket === 'SAVINGS');
  if (!savings) return null;
  const shareReached = savings.state === 'TARGET_REACHED';

  return (
    <section className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <span aria-hidden className={cn('size-2.5 rounded-[3px]', BUCKET_INFO.SAVINGS.dot)} />
          Savings
        </h2>
        <span className={cn('text-caption font-semibold', shareReached ? 'text-success' : 'text-muted-foreground')}>
          {shareReached ? 'Target reached' : `${formatINR(savings.spent)} of ${formatINR(savings.limit)}`}
        </span>
      </div>

      {usage.targets.length === 0 ? (
        <>
          <span className="text-[22px] font-extrabold">
            {formatINR(savings.spent)} <span className="text-sm font-medium text-muted-foreground">of {formatINR(savings.limit)}</span>
          </span>
          <ProgressBar value={savings.percentOfQuota ?? 0} tone="success" label="Savings share reached" />
          <span className="text-caption text-muted-foreground">
            {savings.percentOfQuota === null ? 'No savings share this month' : `${Math.round(savings.percentOfQuota)}% of the savings share`}
          </span>
        </>
      ) : (
        usage.targets.map((t) => (
          <div key={t.categoryId} className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-2 text-caption">
              <span className="font-semibold">{t.categoryName}</span>
              <span className={t.reached ? 'font-semibold text-success' : 'text-muted-foreground'}>
                {t.reached ? 'Target reached · ' : ''}
                {t.actualPercent}% of {t.targetPercent}% target
              </span>
            </div>
            <ProgressBar
              value={t.targetPercent > 0 ? (t.actualPercent / t.targetPercent) * 100 : 0}
              tone="success"
              label={`${t.categoryName} target reached`}
            />
          </div>
        ))
      )}
    </section>
  );
}
