import { BUCKETS, BUCKET_INFO, type Bucket } from '@/types/constants';
import { cn } from '@/lib/cn';

/** Three-colour bar showing how the budget divides between buckets. */
export function SplitBar({ percents, className }: { percents: Record<Bucket, number>; className?: string }) {
  return (
    <div aria-hidden className={cn('flex h-[18px] gap-[3px] overflow-hidden rounded-full bg-track', className)}>
      {BUCKETS.map((b) => (
        <div
          key={b}
          className={cn('h-full transition-[width] duration-300', BUCKET_INFO[b].bar)}
          style={{ width: `${Math.max(0, Math.min(100, percents[b]))}%` }}
        />
      ))}
    </div>
  );
}
