import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-card border border-border bg-card p-6', className)} {...props} />;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-section font-bold text-foreground">{children}</h2>
      {action}
    </div>
  );
}
