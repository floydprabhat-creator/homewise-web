import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export const inputStyles = cn(
  'h-11 w-full rounded-control border-[1.5px] border-border bg-input px-3.5 text-body font-medium text-foreground transition-shadow',
  'placeholder:font-normal placeholder:text-muted-foreground',
  'focus-visible:border-focus-border focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] focus-visible:outline-none',
  'aria-invalid:border-danger aria-invalid:focus-visible:border-danger',
  'disabled:cursor-not-allowed disabled:bg-neutral disabled:text-muted-foreground',
);

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(inputStyles, className)} {...props} />;
}
