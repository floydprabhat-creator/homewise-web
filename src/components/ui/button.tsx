import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-disabled disabled:text-disabled-foreground',
  outline:
    'border-[1.5px] border-accent bg-card text-accent hover:bg-primary-subtle disabled:border-border disabled:text-disabled-foreground',
  secondary: 'border-[1.5px] border-border bg-card text-foreground hover:bg-neutral disabled:text-disabled-foreground',
  ghost: 'text-accent hover:bg-primary-subtle disabled:text-disabled-foreground',
  danger:
    'bg-danger text-danger-foreground hover:brightness-95 disabled:bg-disabled disabled:text-disabled-foreground',
  /** For use on the purple brand surfaces (sidebar, auth panel). */
  inverse: 'text-white hover:bg-white/15',
} as const;

const sizes = {
  sm: 'h-9 px-3 text-caption font-semibold',
  md: 'h-11 px-5 text-sm font-semibold',
  /** Full-width form actions on the auth pages. */
  lg: 'h-12 px-6 text-body font-bold',
  icon: 'size-10',
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

/** Button classes, also used to style links that look like buttons. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-control whitespace-nowrap transition-colors',
    'disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
