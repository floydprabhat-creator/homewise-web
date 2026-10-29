import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type ChipProps = Omit<ComponentProps<'button'>, 'type'> & { pressed: boolean };

/** Toggle button for filters (bucket chips, "Has attachment"). */
export function Chip({ pressed, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'h-9 rounded-full border-[1.5px] px-3.5 text-caption font-semibold whitespace-nowrap transition-colors',
        pressed
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-neutral',
        className,
      )}
      {...props}
    />
  );
}
