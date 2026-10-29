import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Session } from '@/types/api';

/** The API answers with the updated session: put it in the cache, and refresh what shows names and photos. */
function useSessionUpdate() {
  const queryClient = useQueryClient();
  return (session: Session) => {
    queryClient.setQueryData(queryKeys.me, session);
    queryClient.invalidateQueries({ queryKey: queryKeys.household });
    queryClient.invalidateQueries({ queryKey: queryKeys.occurrencesAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.spendingAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  };
}

export function useUpdateName() {
  const onSuccess = useSessionUpdate();
  return useMutation({
    mutationFn: (name: string) => api<Session>('/users/me', { method: 'PATCH', body: { name } }),
    onSuccess,
  });
}

export function useSetAvatar() {
  const onSuccess = useSessionUpdate();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return api<Session>('/users/me/avatar', { method: 'PUT', body: form });
    },
    onSuccess,
  });
}

export function useRemoveAvatar() {
  const onSuccess = useSessionUpdate();
  return useMutation({ mutationFn: () => api<Session>('/users/me/avatar', { method: 'DELETE' }), onSuccess });
}

export function useSendPasswordCode() {
  return useMutation({
    mutationFn: () => api<{ sentTo: string; expiresAt: string }>('/users/me/password-code', { method: 'POST' }),
  });
}

export type ChangePasswordInput = { newPassword: string } & ({ currentPassword: string } | { code: string });

/** This device gets a fresh session cookie; every other device is signed out. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => api<void>('/users/me/password', { method: 'POST', body: input }),
  });
}
