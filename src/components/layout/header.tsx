import type { ReactNode } from 'react';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

/** White top bar used outside the app shell (onboarding). `children` sits on the right, e.g. a stepper. */
export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-8">
      <Logo />
      <div className="flex items-center gap-2 sm:gap-4">
        {children}
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
