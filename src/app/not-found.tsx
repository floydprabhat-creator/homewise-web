import { MapPinOff } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { buttonStyles } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Page not found · HomeWise' };

// "/" sends signed-in users to the dashboard and everyone else to the login page (proxy.ts).
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <ThemeToggle className="absolute top-4 right-4" />
      <Logo />
      <EmptyState
        icon={MapPinOff}
        title="Page not found"
        description="This page doesn't exist or has moved. Check the address, or head back to HomeWise."
        action={
          <Link href="/" className={buttonStyles({ className: 'mt-2' })}>
            Go to HomeWise
          </Link>
        }
      />
    </main>
  );
}
