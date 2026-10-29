import type { Metadata } from 'next';
import { BillsView } from '@/features/bills/components/bills-view';

export const metadata: Metadata = { title: 'Bills · HomeWise' };

export default function BillsPage() {
  return <BillsView />;
}
