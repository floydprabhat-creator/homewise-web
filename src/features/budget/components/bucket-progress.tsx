import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { BudgetUsage } from '@/types/api';
import { BUCKET_INFO } from '@/types/constants';
import { bucketTone, quotaLine, STATE_LABEL } from '../usage';

type BucketProgressProps = { bucket: BudgetUsage['buckets'][number] };

/** Essentials or Lifestyle: spent against its quota, with colour plus a text state. */
export function BucketProgress({ bucket: b }: BucketProgressProps) {
  const info = BUCKET_INFO[b.bucket];
  const state = STATE_LABEL[b.state];

  return (
    <section className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <span aria-hidden className={cn('size-2.5 rounded-[3px]', info.dot)} />
          {info.label}
        </h2>
        <span className={cn('text-caption font-semibold', state.className)}>{state.text}</span>
      </div>
      <span className="text-[22px] font-extrabold">
        {formatINR(b.spent)} <span className="text-sm font-medium text-muted-foreground">of {formatINR(b.limit)}</span>
      </span>
      <ProgressBar value={b.percentOfQuota ?? (Number(b.spent) > 0 ? 100 : 0)} tone={bucketTone(b)} label={`${info.label} quota used`} />
      <span className="text-caption text-muted-foreground">{quotaLine(b)}</span>
    </section>
  );
}
