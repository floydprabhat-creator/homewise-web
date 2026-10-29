import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { FailedFile, SpendingEntryDetail, SpendingFilters, SpendingList } from '@/types/api';
import type { SpendingFormValues } from './schemas';

function toQuery(filters: SpendingFilters) {
  const params = new URLSearchParams({ month: filters.month, page: String(filters.page) });
  if (filters.bucket) params.set('bucket', filters.bucket);
  if (filters.recordedBy) params.set('recordedBy', filters.recordedBy);
  if (filters.hasAttachment) params.set('hasAttachment', 'true');
  if (filters.q) params.set('q', filters.q);
  return params.toString();
}

export function useSpending(filters: SpendingFilters) {
  return useQuery({
    queryKey: queryKeys.spending(filters),
    queryFn: () => api<SpendingList>(`/transactions?${toQuery(filters)}`),
    // Keep the old page on screen while the next filter or page loads.
    placeholderData: keepPreviousData,
  });
}

export function useSpendingEntry(id: string | null) {
  return useQuery({
    queryKey: queryKeys.spendingEntry(id ?? ''),
    queryFn: () => api<{ transaction: SpendingEntryDetail }>(`/transactions/${id}`).then((r) => r.transaction),
    enabled: Boolean(id),
  });
}

/** After any spending change: the list, budget figures and dashboard are stale. */
function useInvalidateSpending() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.spendingAll });
    queryClient.invalidateQueries({ queryKey: ['budget'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

type SaveResult = { transaction: SpendingEntryDetail; failedFiles: FailedFile[] };

export function useCreateSpending() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ values, files }: { values: SpendingFormValues; files: File[] }) => {
      const body = { ...values, note: values.note || undefined };
      if (files.length === 0) return api<SaveResult>('/transactions', { method: 'POST', body });

      const form = new FormData();
      for (const [key, value] of Object.entries(body)) if (value !== undefined) form.append(key, value);
      for (const file of files) form.append('files', file);
      return api<SaveResult>('/transactions', { method: 'POST', body: form });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateSpending() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: SpendingFormValues }) =>
      api<{ transaction: SpendingEntryDetail }>(`/transactions/${id}`, { method: 'PATCH', body: values }),
    onSuccess: invalidate,
  });
}

export function useDeleteSpending() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      // Drop the deleted entry first, so the refresh below doesn't re-fetch it (a 404).
      queryClient.removeQueries({ queryKey: queryKeys.spendingEntry(id) });
      invalidate();
    },
  });
}

export function useAddAttachments() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => {
      const form = new FormData();
      for (const file of files) form.append('files', file);
      return api<SaveResult>(`/transactions/${id}/attachments`, { method: 'POST', body: form });
    },
    onSuccess: invalidate,
  });
}

export function useRemoveAttachment() {
  const invalidate = useInvalidateSpending();
  return useMutation({
    mutationFn: (attachmentId: string) => api<void>(`/attachments/${attachmentId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
}

/** Signed URLs last 5 minutes, so they're fetched when a file is opened, not cached. */
export function useAttachmentUrl() {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      api<{ url: string; contentType: string; originalName: string }>(`/attachments/${attachmentId}/url`),
  });
}
