'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { DashboardResponse } from '@/types/api';
import { BUCKET_INFO, type Bucket } from '@/types/constants';

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Surface gap between segments, in px along the ring. */
const GAP = 3;

const STROKE: Record<Bucket, string> = {
  ESSENTIALS: 'stroke-bucket-essentials',
  LIFESTYLE: 'stroke-bucket-lifestyle',
  SAVINGS: 'stroke-bucket-savings',
};

type BreakdownChartProps = { breakdown: DashboardResponse['breakdown']; spent: string };

/**
 * Donut by bucket; selecting a bucket (legend button or segment) lists its categories as bars.
 * Bucket names and shares are always printed in the legend, so colour is never the only cue.
 */
export function BreakdownChart({ breakdown, spent }: BreakdownChartProps) {
  const total = Number(spent);
  const largest = [...breakdown].sort((a, b) => Number(b.spent) - Number(a.spent))[0]?.bucket ?? 'ESSENTIALS';
  const [selected, setSelected] = useState<Bucket>(largest);
  const [hovered, setHovered] = useState<Bucket | null>(null);

  const share = (value: string) => (total > 0 ? (Number(value) / total) * 100 : 0);
  const visible = breakdown.filter((b) => Number(b.spent) > 0);
  const gap = visible.length > 1 ? GAP : 0;

  // Each segment starts where the previous ones end.
  const segments = visible.reduce<{ bucket: Bucket; dash: string; offset: number; end: number }[]>((acc, b) => {
    const start = acc.at(-1)?.end ?? 0;
    const length = (Number(b.spent) / total) * CIRCUMFERENCE;
    return [...acc, { bucket: b.bucket, dash: `${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`, offset: -start, end: start + length }];
  }, []);

  const focus = hovered ?? null;
  const focusRow = focus ? breakdown.find((b) => b.bucket === focus) : null;
  const categories = breakdown.find((b) => b.bucket === selected)?.categories ?? [];
  const maxCategory = Math.max(...categories.map((c) => Number(c.spent)), 1);
  const summary = breakdown.map((b) => `${BUCKET_INFO[b.bucket].label} ${Math.round(share(b.spent))}%`).join(', ');

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative size-[180px] shrink-0">
          <svg viewBox="0 0 180 180" className="size-full" role="img" aria-label={`Spending by bucket: ${summary}`}>
            <g transform="rotate(-90 90 90)" fill="none" strokeWidth={22}>
              <circle cx={90} cy={90} r={RADIUS} className="stroke-track" />
              {segments.map((s) => (
                <circle
                  key={s.bucket}
                  cx={90}
                  cy={90}
                  r={RADIUS}
                  className={cn(STROKE[s.bucket], 'cursor-pointer transition-opacity', focus && focus !== s.bucket && 'opacity-40')}
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.offset}
                  onMouseEnter={() => setHovered(s.bucket)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(s.bucket)}
                />
              ))}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
            <span className="text-xl font-extrabold">{formatINR(focusRow ? focusRow.spent : spent)}</span>
            <span className="text-xs text-muted-foreground">
              {focusRow ? `${BUCKET_INFO[focusRow.bucket].label} · ${Math.round(share(focusRow.spent))}%` : 'spent'}
            </span>
          </div>
        </div>

        <div className="flex min-w-[200px] flex-1 flex-col gap-3">
          <span className="text-xs font-bold tracking-[0.05em] text-muted-foreground">
            {BUCKET_INFO[selected].label.toUpperCase()} BY CATEGORY
          </span>
          {categories.length === 0 ? (
            <p className="text-caption text-muted-foreground">Nothing spent in {BUCKET_INFO[selected].label} yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {categories.slice(0, 6).map((c) => (
                <li key={c.categoryId} className="flex flex-col gap-1">
                  <div className="flex justify-between gap-2 text-caption">
                    <span>{c.name}</span>
                    <span className="font-bold">{formatINR(c.spent)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-track">
                    <div
                      className={cn('h-full rounded-full', BUCKET_INFO[selected].bar)}
                      style={{ width: `${(Number(c.spent) / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div role="group" aria-label="Show categories for" className="flex flex-wrap gap-2">
        {breakdown.map((b) => (
          <button
            key={b.bucket}
            type="button"
            aria-pressed={selected === b.bucket}
            onClick={() => setSelected(b.bucket)}
            onMouseEnter={() => setHovered(b.bucket)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-caption transition-colors',
              selected === b.bucket ? 'border-accent bg-primary-subtle font-semibold' : 'border-transparent hover:bg-neutral',
            )}
          >
            <span aria-hidden className={cn('size-2.5 rounded-[3px]', BUCKET_INFO[b.bucket].dot)} />
            {BUCKET_INFO[b.bucket].label} {Math.round(share(b.spent))}%
          </button>
        ))}
      </div>
    </div>
  );
}
