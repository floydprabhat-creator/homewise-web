import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AffixInputProps = ComponentProps<'input'> & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Large, bold value: the amount field and split percentages. */
  emphasis?: boolean;
  wrapperClassName?: string;
};

/** Input with fixed text before or after the value, e.g. "₹ 1,250" or "50 %". */
export function AffixInput({ prefix, suffix, emphasis = false, wrapperClassName, className, ...props }: AffixInputProps) {
  return (
    <div
      className={cn(
        'flex h-11 items-center gap-2 rounded-control border-[1.5px] border-border bg-input px-3.5 transition-shadow',
        'focus-within:border-focus-border focus-within:shadow-[0_0_0_3px_var(--focus-ring)]',
        'has-[input[aria-invalid=true]]:border-danger',
        'has-[input:disabled]:bg-neutral',
        emphasis && 'h-[52px]',
        wrapperClassName,
      )}
    >
      {prefix && <span className={cn('text-muted-foreground', emphasis ? 'text-lg' : 'text-body')}>{prefix}</span>}
      <input
        className={cn(
          'w-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed',
          emphasis ? 'text-xl font-bold' : 'text-body font-medium',
          className,
        )}
        {...props}
      />
      {suffix && <span className="text-base font-semibold text-muted-foreground">{suffix}</span>}
    </div>
  );
}
