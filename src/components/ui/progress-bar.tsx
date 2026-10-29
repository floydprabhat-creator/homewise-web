import { cn } from '@/lib/cn';

const tones = {
  primary: 'bg-bucket-essentials',
  lifestyle: 'bg-bucket-lifestyle',
  success: 'bg-bucket-savings',
  warning: 'bg-warning-bar',
  danger: 'bg-danger',
  /** White bar on the purple brand surface. */
  inverse: 'bg-white',
} as const;

export type ProgressTone = keyof typeof tones;

type ProgressBarProps = {
  /** 0–100; values above 100 render as a full bar. */
  value: number;
  tone?: ProgressTone;
  label: string;
  className?: string;
};

export function ProgressBar({ value, tone = 'primary', label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={cn('h-2 w-full overflow-hidden rounded-full', tone === 'inverse' ? 'bg-white/18' : tone === 'success' ? 'bg-success-subtle' : 'bg-track', className)}
    >
      <div className={cn('h-full rounded-full', tones[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}
