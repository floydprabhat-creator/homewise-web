'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { getTheme, setTheme, subscribeTheme } from '@/lib/theme';

export function ThemeToggle({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  // The server always renders light; the client reads the real theme after hydration.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => 'light' as const);
  const next = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <Button
      variant={inverse ? 'inverse' : 'ghost'}
      size="icon"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={className}
    >
      <Icon aria-hidden className="size-5" />
    </Button>
  );
}
