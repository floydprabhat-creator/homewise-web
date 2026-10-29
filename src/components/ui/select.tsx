import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { inputStyles } from './input';

type SelectProps = ComponentProps<'select'> & { wrapperClassName?: string };

/**
 * Native select styled like Input; native keeps keyboard and screen-reader behaviour for free.
 * The browser's arrow sits too close to the border and ignores padding, so it's hidden and
 * replaced with a chevron 14px in from the edge.
 */
export function Select({ className, wrapperClassName, ...props }: SelectProps) {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <select className={cn(inputStyles, 'appearance-none pr-10', className)} {...props} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
