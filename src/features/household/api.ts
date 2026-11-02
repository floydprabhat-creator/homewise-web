import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { HouseholdResponse, HouseholdSummary, Invite, InvitePreview } from '@/types/api';

export function useHousehold() {
  return useQuery({
    queryKey: queryKeys.household,
    queryFn: () => api<HouseholdResponse>('/household'),
  });
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; type?: 'FAMILY' }) =>
      api<{ household: HouseholdSummary }>('/household', { method: 'PATCH', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.household });
      // The sidebar shows the household name from the session.
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api<void>(`/household/members/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.household });
      // Their unpaid bills moved to the head.
      queryClient.invalidateQueries({ queryKey: queryKeys.occurrencesAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.billsAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

/** Head only. */
export function useInvites({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.invites,
    queryFn: () => api<{ invites: Invite[] }>('/household/invites').then((r) => r.invites),
    enabled,
  });
}

/** Refreshes the list after success or failure: a failed request may still have changed it (e.g. a timeout after saving). */
function useInviteMutation<T>(mutationFn: (arg: T) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.invites }) });
}

export const useCreateInvite = () =>
  useInviteMutation((input: { email: string; name?: string }) =>
    api<{ invite: Invite }>('/household/invites', { method: 'POST', body: input }),
  );
export const useResendInvite = () =>
  useInviteMutation((id: string) => api<{ invite: Invite }>(`/household/invites/${id}/resend`, { method: 'POST' }));
export const useRevokeInvite = () =>
  useInviteMutation((id: string) => api<void>(`/household/invites/${id}`, { method: 'DELETE' }));

/** Public: works without a session. */
export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: queryKeys.invitePreview(token),
    queryFn: () => api<InvitePreview>(`/invites/${token}`),
    retry: false,
  });
}

export function useAcceptInvite(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { confirmArchivePersonal?: boolean }) =>
      api<void>(`/invites/${token}/accept`, { method: 'POST', body: input }),
    // A different household: nothing cached from the old one should survive.
    onSuccess: () => queryClient.clear(),
  });
}
