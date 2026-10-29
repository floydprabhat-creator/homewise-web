import Link from 'next/link';
import { cn } from '@/lib/cn';
import { LogoMark } from './logo-mark';

export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="HomeWise home" className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark inverse={inverse} />
      <span className={cn('font-logo text-[1.625rem] leading-none', inverse ? 'text-white' : 'text-accent')}>
        HomeWise
      </span>
    </Link>
  );
}
