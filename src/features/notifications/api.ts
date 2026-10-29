import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { NotificationList } from '@/types/api';

/** Newest first, with the unread count for the bell. Refreshes every 5 minutes and on window focus. */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api<NotificationList>('/notifications'),
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
