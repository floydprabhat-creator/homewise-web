import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { DashboardResponse } from '@/types/api';

/** One request for every widget. Spending and bill mutations invalidate queryKeys.dashboard. */
export function useDashboard(month: string) {
  return useQuery({
    queryKey: queryKeys.dashboardMonth(month),
    queryFn: () => api<DashboardResponse>(`/dashboard?month=${month}`),
    placeholderData: keepPreviousData,
  });
}
