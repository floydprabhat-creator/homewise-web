import { BUCKETS, type Bucket } from '@/types/constants';

// Mirrors the API's budget rules for instant feedback. The API is the real check.

/** Values as typed (strings), so "33." doesn't jump while the user is typing. */
export type SplitDraft = {
  allocations: Record<Bucket, string>;
  /** Savings targets; `key` is a category ID, or a name during onboarding. */
  targets: { key: string; name: string; percent: string }[];
};

export const toHundredths = (v: string | number) => Math.round(Number(v || 0) * 100);
const hasTwoDecimalsAtMost = (v: string) => /^\d{0,3}(\.\d{0,2})?$/.test(v.trim());

export type SplitCheck = {
  totalHundredths: number;
  totalOk: boolean;
  /** Per-field messages keyed by bucket or target key. */
  errors: Record<string, string>;
  targetsError?: string;
  valid: boolean;
};

export function checkSplit(draft: SplitDraft): SplitCheck {
  const errors: Record<string, string> = {};
  for (const bucket of BUCKETS) {
    const v = draft.allocations[bucket];
    if (!hasTwoDecimalsAtMost(v) || Number(v) > 100) errors[bucket] = 'Use 0–100, up to 2 decimals';
  }
  for (const t of draft.targets) {
    if (!hasTwoDecimalsAtMost(t.percent) || Number(t.percent) > 100) errors[t.key] = 'Use 0–100, up to 2 decimals';
  }

  const totalHundredths = BUCKETS.reduce((sum, b) => sum + toHundredths(draft.allocations[b]), 0);
  const totalOk = totalHundredths === 10000;
  const targetsTotal = draft.targets.reduce((sum, t) => sum + toHundredths(t.percent), 0);
  const targetsError =
    targetsTotal > toHundredths(draft.allocations.SAVINGS) ? 'Savings targets add up to more than the Savings share' : undefined;

  return { totalHundredths, totalOk, errors, targetsError, valid: totalOk && !targetsError && Object.keys(errors).length === 0 };
}

export const allocationsToNumbers = (a: Record<Bucket, string>) =>
  Object.fromEntries(BUCKETS.map((b) => [b, Number(a[b] || 0)])) as Record<Bucket, number>;

/** Accepts "", "1250" or "1250.50" with a positive value. */
export function checkAmount(value: string): string | undefined {
  const v = value.replace(/,/g, '').trim();
  if (!v) return 'Enter your monthly budget';
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(v)) return 'Enter an amount with up to 2 decimals';
  if (Number(v) <= 0) return 'Amount must be greater than zero';
  return undefined;
}

export const normalizeAmount = (value: string) => value.replace(/,/g, '').trim();
