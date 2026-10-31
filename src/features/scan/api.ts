import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ScannedBill } from '@/types/api';

/** Whether the API has AI set up; without it the scan box isn't shown. */
export function useScanStatus() {
  return useQuery({
    queryKey: queryKeys.scanStatus,
    queryFn: () => api<{ enabled: boolean }>('/scan'),
    staleTime: Infinity,
  });
}

/** Reads a bill photo or PDF. Nothing is saved; the result only fills in a form. */
export function useScanBill() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api<ScannedBill>('/scan', { method: 'POST', body: form });
    },
  });
}
