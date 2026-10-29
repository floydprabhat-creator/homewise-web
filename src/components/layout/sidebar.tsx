'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from './nav-items';

/** Primary navigation, rendered on the purple sidebar and in the mobile menu. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-control px-4 py-3 text-body transition-colors',
              active ? 'bg-white/15 font-bold text-white' : 'text-white/85 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
