'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { currentMonthIST } from '@/lib/dates';
import type { SpendingFilters } from '@/types/api';
import { BUCKETS, type Bucket } from '@/types/constants';

/** Spending filters live in the URL (?month=2026-10&bucket=LIFESTYLE&q=milk) so a view can be refreshed or shared. */
export function useSpendingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo<SpendingFilters>(() => {
    const month = params.get('month');
    const bucket = params.get('bucket');
    const page = Number(params.get('page'));
    return {
      month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentMonthIST(),
      page: Number.isInteger(page) && page > 0 ? page : 1,
      bucket: BUCKETS.includes(bucket as Bucket) ? (bucket as Bucket) : undefined,
      recordedBy: params.get('recordedBy') || undefined,
      hasAttachment: params.get('hasAttachment') === 'true' || undefined,
      q: params.get('q') || undefined,
    };
  }, [params]);

  /** Any change other than the page itself goes back to page 1. */
  const setFilters = useCallback(
    (patch: Partial<SpendingFilters>) => {
      const next = { ...filters, ...patch, page: patch.page ?? 1 };
      const query = new URLSearchParams();
      if (next.month !== currentMonthIST()) query.set('month', next.month);
      if (next.page > 1) query.set('page', String(next.page));
      if (next.bucket) query.set('bucket', next.bucket);
      if (next.recordedBy) query.set('recordedBy', next.recordedBy);
      if (next.hasAttachment) query.set('hasAttachment', 'true');
      if (next.q) query.set('q', next.q);
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, setFilters };
}
