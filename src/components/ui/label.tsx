import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-caption font-semibold text-foreground', className)} {...props} />;
}
