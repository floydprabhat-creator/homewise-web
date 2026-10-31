'use client';

import { CircleAlert, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button, buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

/** A page that crashed while rendering: the sidebar stays usable, and the page can be retried. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <EmptyState
        icon={CircleAlert}
        title="Something went wrong"
        description="This page couldn't be shown. Try again, or go back to the dashboard. Nothing you saved was lost."
        action={
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Button onClick={reset}>
              <RotateCcw aria-hidden className="size-4" />
              Try again
            </Button>
            <Link href="/dashboard" className={buttonStyles({ variant: 'secondary' })}>
              Go to dashboard
            </Link>
          </div>
        }
      />
    </Card>
  );
}
