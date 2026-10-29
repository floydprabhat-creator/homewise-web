import { BucketProgress } from '@/features/budget/components/bucket-progress';
import { SavingsTargets } from '@/features/budget/components/savings-targets';
import type { BudgetUsage } from '@/types/api';

/** Essentials and Lifestyle quotas, then Savings with its targets. */
export function BucketCards({ usage }: { usage: BudgetUsage }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
      {usage.buckets
        .filter((b) => b.bucket !== 'SAVINGS')
        .map((b) => (
          <BucketProgress key={b.bucket} bucket={b} />
        ))}
      <SavingsTargets usage={usage} />
    </div>
  );
}
