'use client';

import { Check, CircleAlert } from 'lucide-react';
import { AffixInput } from '@/components/ui/affix-input';
import { Alert } from '@/components/ui/alert';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/cn';
import { formatINR, shareOf } from '@/lib/format';
import { BUCKETS, BUCKET_INFO, type Bucket } from '@/types/constants';
import { allocationsToNumbers, type SplitCheck, type SplitDraft } from '../schemas';
import { SplitBar } from './split-bar';

type SplitEditorProps = {
  totalAmount: string;
  draft: SplitDraft;
  check: SplitCheck;
  /** Omit for a read-only view (members). */
  onChange?: (draft: SplitDraft) => void;
};

// Accept only what a percentage can look like while typing: digits, one dot, two decimals.
const percentInput = (v: string) => /^\d{0,3}(\.\d{0,2})?$/.test(v);

/** Bucket shares and savings targets, with live rupee amounts and a running total. */
export function SplitEditor({ totalAmount, draft, check, onChange }: SplitEditorProps) {
  const readOnly = !onChange;
  const percents = allocationsToNumbers(draft.allocations);

  const setBucket = (bucket: Bucket, value: string) => {
    if (percentInput(value)) onChange?.({ ...draft, allocations: { ...draft.allocations, [bucket]: value } });
  };
  const setTarget = (key: string, value: string) => {
    if (percentInput(value)) {
      onChange?.({ ...draft, targets: draft.targets.map((t) => (t.key === key ? { ...t, percent: value } : t)) });
    }
  };

  const total = check.totalHundredths / 100;
  const diff = Math.abs(100 - total);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2.5">
        <SplitBar percents={percents} />
        <div className="flex justify-between text-caption text-muted-foreground">
          <span>₹0</span>
          <span>{formatINR(totalAmount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {BUCKETS.map((bucket) => (
          <section key={bucket} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className={cn('size-3 rounded', BUCKET_INFO[bucket].dot)} />
              <h2 className="text-section font-bold">{BUCKET_INFO[bucket].label}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{BUCKET_INFO[bucket].description}</p>

            <div className="flex items-end justify-between gap-3">
              {readOnly ? (
                <span className="text-xl font-bold">{percents[bucket]}%</span>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`split-${bucket}`} className="text-xs font-semibold text-muted-foreground">
                    Share
                  </label>
                  <AffixInput
                    id={`split-${bucket}`}
                    inputMode="decimal"
                    suffix="%"
                    emphasis
                    wrapperClassName="h-12 w-28"
                    value={draft.allocations[bucket]}
                    aria-invalid={check.errors[bucket] ? true : undefined}
                    onChange={(e) => setBucket(bucket, e.target.value)}
                  />
                </div>
              )}
              <span className="text-2xl font-extrabold tracking-tight">
                {formatINR(shareOf(totalAmount, percents[bucket]))}
              </span>
            </div>
            <FieldError message={check.errors[bucket]} />

            {bucket === 'SAVINGS' && draft.targets.length > 0 && (
              <div className="flex flex-col gap-2.5 border-t border-border pt-3.5">
                <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Targets inside savings</span>
                {draft.targets.map((t) => (
                  <div key={t.key} className="flex items-center justify-between gap-3 text-sm">
                    <label htmlFor={`target-${t.key}`}>{t.name}</label>
                    {readOnly ? (
                      <span className="font-bold">
                        {Number(t.percent || 0)}% · {formatINR(shareOf(totalAmount, Number(t.percent || 0)))}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <AffixInput
                          id={`target-${t.key}`}
                          inputMode="decimal"
                          suffix="%"
                          wrapperClassName="h-9 w-20 px-2.5"
                          className="text-sm font-bold"
                          value={t.percent}
                          aria-invalid={check.errors[t.key] || check.targetsError ? true : undefined}
                          onChange={(e) => setTarget(t.key, e.target.value)}
                        />
                        <span className="w-20 text-right font-bold">{formatINR(shareOf(totalAmount, Number(t.percent || 0)))}</span>
                      </span>
                    )}
                  </div>
                ))}
                <FieldError message={check.targetsError} />
              </div>
            )}
          </section>
        ))}
      </div>

      {!readOnly &&
        (check.totalOk ? (
          <Alert tone="success" icon={Check} className="font-semibold">
            Total 100% · {formatINR(totalAmount)} allocated
          </Alert>
        ) : (
          <Alert tone="danger" icon={CircleAlert} className="font-semibold">
            Total {total}% · {total < 100 ? `${diff.toFixed(2).replace(/\.00$/, '')}% left to allocate` : `${diff.toFixed(2).replace(/\.00$/, '')}% over`}
          </Alert>
        ))}
    </div>
  );
}
