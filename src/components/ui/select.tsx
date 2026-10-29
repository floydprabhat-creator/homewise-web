import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { inputStyles } from './input';

/** Native select styled like Input; native keeps keyboard and screen-reader behaviour for free. */
export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(inputStyles, 'pr-8', className)} {...props} />;
}
