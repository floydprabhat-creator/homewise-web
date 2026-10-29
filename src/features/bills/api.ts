import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Bill, FailedFile, Occurrence, OccurrenceQuery } from '@/types/api';
import type { BillFormValues } from './schemas';

function toQuery(query: OccurrenceQuery) {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  if (query.status) params.set('status', query.status);
  if (query.includeOverdue) params.set('includeOverdue', 'true');
  if (query.billId) params.set('billId', query.billId);
  return params.toString();
}

export function useBills({ includeArchived = false } = {}) {
  return useQuery({
    queryKey: queryKeys.bills(includeArchived),
    queryFn: () => api<{ bills: Bill[] }>(`/bills?includeArchived=${includeArchived}`).then((r) => r.bills),
  });
}

export function useOccurrences(query: OccurrenceQuery, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.occurrences(query),
    queryFn: () => api<{ items: Occurrence[] }>(`/bill-occurrences?${toQuery(query)}`).then((r) => r.items),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** Any bill change moves the due list, the templates' "next due" and the dashboard's bills widget. */
function useInvalidateBills() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.billsAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.occurrencesAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

/** Paying or undoing also adds or removes a spending entry, so budget figures are stale too. */
function useInvalidatePayment() {
  const queryClient = useQueryClient();
  const invalidateBills = useInvalidateBills();
  return () => {
    invalidateBills();
    queryClient.invalidateQueries({ queryKey: queryKeys.spendingAll });
    queryClient.invalidateQueries({ queryKey: ['budget'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };
}

export function useCreateBill() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: (values: BillFormValues) => api<{ bill: Bill }>('/bills', { method: 'POST', body: values }),
    onSuccess: invalidate,
  });
}

export type UpdateBillInput = Partial<Omit<BillFormValues, 'frequency' | 'firstDueDate'>> & {
  status?: 'ACTIVE' | 'PAUSED';
};

export function useUpdateBill() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateBillInput & { id: string }) =>
      api<{ bill: Bill }>(`/bills/${id}`, { method: 'PATCH', body: input }),
    onSuccess: invalidate,
  });
}

export function useDeleteBill() {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: (id: string) => api<{ result: 'deleted' | 'archived' }>(`/bills/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
}

export function useUpdateOccurrence() {
  const invalidate = useInvalidateBills();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; amountDue?: string; assigneeId?: string | null }) =>
      api<{ occurrence: Occurrence }>(`/bill-occurrences/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      invalidate();
      // The amount due feeds "committed" in the budget figures.
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

export type PayInput = { paidAmount: string; paidAt: string };

export function usePayOccurrence() {
  const invalidate = useInvalidatePayment();
  return useMutation({
    mutationFn: ({ id, values, receipt }: { id: string; values: PayInput; receipt?: File }) => {
      const path = `/bill-occurrences/${id}/pay`;
      type Result = { occurrence: Occurrence; failedFiles: FailedFile[] };
      if (!receipt) return api<Result>(path, { method: 'POST', body: values });

      const form = new FormData();
      form.append('paidAmount', values.paidAmount);
      form.append('paidAt', values.paidAt);
      form.append('receipt', receipt);
      return api<Result>(path, { method: 'POST', body: form });
    },
    onSuccess: invalidate,
  });
}

export function useUnpayOccurrence() {
  const invalidate = useInvalidatePayment();
  return useMutation({
    mutationFn: (id: string) => api<{ occurrence: Occurrence }>(`/bill-occurrences/${id}/unpay`, { method: 'POST' }),
    onSuccess: invalidate,
  });
}
