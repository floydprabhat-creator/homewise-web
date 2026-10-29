import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/cn';

type StepperProps = { steps: string[]; current: number };

/** "✓ Household — ✓ Monthly budget — (3) Split". `current` is 0-based. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-2.5 text-caption font-semibold">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={label}>
            {i > 0 && <li aria-hidden className="hidden h-px w-6 bg-border sm:block" />}
            <li
              aria-current={active ? 'step' : undefined}
              className={cn('flex items-center gap-2', active ? 'text-foreground' : 'text-muted-foreground')}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs',
                  done && 'bg-success-subtle text-success',
                  active && 'bg-primary text-primary-foreground',
                  !done && !active && 'border border-border',
                )}
              >
                {done ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn(!active && 'hidden sm:inline')}>{label}</span>
              {done && <span className="sr-only">(done)</span>}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
