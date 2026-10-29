import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const tones = {
  danger: 'bg-danger-subtle text-danger',
  warning: 'bg-warning-subtle text-warning',
  success: 'bg-success-subtle text-success',
  neutral: 'bg-neutral text-neutral-foreground',
  brand: 'bg-primary text-primary-foreground',
  'brand-subtle': 'bg-primary-subtle text-accent',
} as const;

const dotColors = {
  danger: 'bg-danger',
  warning: 'bg-warning-bar',
  success: 'bg-success',
  neutral: 'bg-muted-foreground',
  brand: 'bg-primary-foreground',
  'brand-subtle': 'bg-accent',
} as const;

const shapes = {
  /** Statuses: Overdue, Due soon, Upcoming, Paid. */
  pill: 'h-7 rounded-full px-3 text-caption font-semibold',
  /** Labels: HEAD, MEMBER, Bill payment. */
  tag: 'h-6 rounded-md px-2.5 text-xs font-bold',
} as const;

export type BadgeTone = keyof typeof tones;

type BadgeProps = {
  tone?: BadgeTone;
  shape?: keyof typeof shapes;
  /** Leading status dot. Every status carries a word, never colour alone. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = 'neutral', shape = 'pill', dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', shapes[shape], tones[tone], className)}>
      {dot && <span aria-hidden className={cn('size-[7px] rounded-full', dotColors[tone])} />}
      {children}
    </span>
  );
}
