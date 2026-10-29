'use client';

import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/api';
import { Logo } from './logo';
import { SidebarNav } from './sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserCard } from './user-card';

/** Purple sidebar on large screens; a top bar with a slide-down menu on small ones. */
export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useMe();
  const needsOnboarding = session?.needsOnboarding;

  // proxy.ts only sees the cookie; the session says whether onboarding is finished.
  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding');
  }, [needsOnboarding, router]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between bg-sidebar px-4 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <Logo inverse className="px-2" />
          <SidebarNav />
        </div>
        <UserCard />
      </aside>

      <header className="sticky top-0 z-20 bg-sidebar lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Logo inverse />
          <div className="flex items-center gap-1">
            <ThemeToggle inverse />
            <Button
              variant="inverse"
              size="icon"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div id="mobile-menu" className="flex flex-col gap-4 border-t border-white/15 px-4 pt-3 pb-4">
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
            {/* The top bar already has the theme toggle. */}
            <UserCard showThemeToggle={false} />
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">{children}</main>
    </div>
  );
}
