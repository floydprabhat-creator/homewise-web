import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { HouseholdResponse } from '@/types/api';

export function useHousehold() {
  return useQuery({
    queryKey: queryKeys.household,
    queryFn: () => api<HouseholdResponse>('/household'),
  });
}
