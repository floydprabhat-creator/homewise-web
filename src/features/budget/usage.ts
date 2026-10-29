import type { ProgressTone } from '@/components/ui/progress-bar';
import { formatINR } from '@/lib/format';
import type { BucketState, BudgetUsage } from '@/types/api';
import { BUCKET_INFO, type Bucket } from '@/types/constants';

type BucketUsage = BudgetUsage['buckets'][number];

/** Text that always accompanies the colour. */
export const STATE_LABEL: Record<BucketState, { text: string; className: string }> = {
  OK: { text: 'On track', className: 'text-success' },
  WARNING: { text: 'Nearing limit', className: 'text-warning' },
  EXCEEDED: { text: 'Over quota', className: 'text-danger' },
  TARGET_REACHED: { text: 'Target reached', className: 'text-success' },
};

/** Bucket colour while on track, amber from 80%, red from 100%. Savings never turns red. */
export function bucketTone(b: Pick<BucketUsage, 'bucket' | 'state'>): ProgressTone {
  if (b.bucket === 'SAVINGS') return 'success';
  if (b.state === 'EXCEEDED') return 'danger';
  if (b.state === 'WARNING') return 'warning';
  return b.bucket === 'LIFESTYLE' ? 'lifestyle' : 'primary';
}

const toPaise = (v: string | number) => Math.round(Number(v) * 100);

/** "62% of quota used · ₹11,400 left", or "Over by ₹1,200" when the quota is used up. */
export function quotaLine(b: BucketUsage) {
  const left = toPaise(b.limit) - toPaise(b.spent);
  if (left < 0) return `Over by ${formatINR(-left / 100)}`;
  if (b.percentOfQuota === null) return `${formatINR(b.spent)} spent`;
  return `${Math.round(b.percentOfQuota)}% of quota used · ${formatINR(left / 100)} left`;
}

/**
 * The effect of an amount before it's saved, from the cached usage response:
 * "This brings Lifestyle to 92% of its quota". `removed` is subtracted first (the entry's
 * original amount when editing). Null when there's no budget to compare against.
 */
export function previewBucket(usage: BudgetUsage | undefined, bucket: Bucket, added: number, removed = 0) {
  const b = usage?.buckets.find((x) => x.bucket === bucket);
  if (!usage?.totalBudget || !b || !(added > 0)) return null;

  const spent = toPaise(b.spent) - Math.round(removed * 100) + Math.round(added * 100);
  const limit = toPaise(b.limit);
  const name = BUCKET_INFO[bucket].label;

  if (limit === 0) return { text: `${name} has no share this month, so this puts it over by ${formatINR(spent / 100)}.`, state: 'EXCEEDED' as const };
  const percent = Math.round((spent * 1000) / limit) / 10;
  if (bucket === 'SAVINGS') {
    return { text: `This brings Savings to ${Math.floor(percent)}% of its share.`, state: percent >= 100 ? ('TARGET_REACHED' as const) : ('OK' as const) };
  }
  const state = percent >= 100 ? ('EXCEEDED' as const) : percent >= 80 ? ('WARNING' as const) : ('OK' as const);
  const over = spent - limit;
  return {
    text:
      over > 0
        ? `This brings ${name} to ${Math.floor(percent)}% of its quota, over by ${formatINR(over / 100)}.`
        : `This brings ${name} to ${Math.floor(percent)}% of its quota.`,
    state,
  };
}

/** Active warnings for the banner: Essentials, Lifestyle and the overall budget. */
export function activeWarnings(usage: BudgetUsage) {
  const warnings: { scope: string; state: 'WARNING' | 'EXCEEDED'; text: string; detail: string }[] = [];
  for (const b of usage.buckets) {
    if (b.bucket === 'SAVINGS' || (b.state !== 'WARNING' && b.state !== 'EXCEEDED')) continue;
    const name = BUCKET_INFO[b.bucket].label;
    const left = toPaise(b.limit) - toPaise(b.spent);
    warnings.push(
      b.state === 'EXCEEDED'
        ? { scope: b.bucket, state: 'EXCEEDED', text: `${name} is over its quota.`, detail: `Over by ${formatINR(-left / 100)}.` }
        : {
            scope: b.bucket,
            state: 'WARNING',
            text: `${name} is at ${Math.floor(b.percentOfQuota ?? 0)}% of its quota.`,
            detail: `${formatINR(left / 100)} left.`,
          },
    );
  }
  if (usage.state !== 'OK' && usage.remaining !== null) {
    const left = toPaise(usage.remaining);
    warnings.push(
      usage.state === 'EXCEEDED'
        ? { scope: 'OVERALL', state: 'EXCEEDED', text: 'Over budget this month.', detail: `Over by ${formatINR(-left / 100)}.` }
        : {
            scope: 'OVERALL',
            state: 'WARNING',
            text: `${Math.floor(usage.percentUsed ?? 0)}% of the budget used.`,
            detail: `${formatINR(left / 100)} left.`,
          },
    );
  }
  return warnings;
}
