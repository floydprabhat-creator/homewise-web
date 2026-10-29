import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { BrandPanel } from '@/features/auth/components/brand-panel';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <BrandPanel />
      <main className="relative flex flex-col items-center justify-center px-4 py-16 sm:px-8">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="w-full max-w-[400px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
