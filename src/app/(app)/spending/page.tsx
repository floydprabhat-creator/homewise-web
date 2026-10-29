import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SpendingView } from '@/features/spending/components/spending-view';

export const metadata: Metadata = { title: 'Spending · HomeWise' };

export default function SpendingPage() {
  // The filters are read from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <SpendingView />
    </Suspense>
  );
}
