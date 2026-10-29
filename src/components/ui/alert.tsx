import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const tones = {
  danger: 'bg-danger-subtle text-danger',
  warning: 'bg-warning-subtle text-warning',
  success: 'bg-success-subtle text-success',
  brand: 'bg-primary-subtle text-foreground [&>svg]:text-accent',
} as const;

type AlertProps = {
  tone?: keyof typeof tones;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

/** Tinted message box: form errors, quota warnings, info notes. */
export function Alert({ tone = 'danger', icon: Icon, children, className }: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-card px-4 py-3 text-body', tones[tone], className)}
    >
      {Icon && <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />}
      <div>{children}</div>
    </div>
  );
}
