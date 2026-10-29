import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardView } from '@/features/dashboard/components/dashboard-view';

export const metadata: Metadata = { title: 'Dashboard · HomeWise' };

export default function DashboardPage() {
  // The month is read from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <DashboardView />
    </Suspense>
  );
}
