import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Category } from '@/types/api';
import type { Bucket } from '@/types/constants';

export function useCategories({ includeArchived = false } = {}) {
  return useQuery({
    queryKey: queryKeys.categories(includeArchived),
    queryFn: () =>
      api<{ categories: Category[] }>(`/categories?includeArchived=${includeArchived}`).then((r) => r.categories),
    // Categories change rarely.
    staleTime: 5 * 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; bucket: Bucket }) =>
      api<{ category: Category }>('/categories', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; name?: string; archived?: boolean }) =>
      api<{ category: Category }>(`/categories/${id}`, { method: 'PATCH', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Spending rows show category names.
      queryClient.invalidateQueries({ queryKey: queryKeys.spendingAll });
    },
  });
}
