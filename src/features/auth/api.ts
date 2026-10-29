import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Session } from '@/types/api';
import type { LoginValues, RegisterValues } from './schemas';

/** Where to send a user right after they log in or sign up. */
export const landingPath = (session: Session) => (session.needsOnboarding ? '/onboarding' : '/dashboard');

export function useMe({ enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<Session>('/auth/me'),
    retry: false,
    enabled,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginValues) => api<Session>('/auth/login', { method: 'POST', body: values }),
    onSuccess: (session) => queryClient.setQueryData(queryKeys.me, session),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: RegisterValues & { inviteToken?: string }) =>
      api<Session>('/auth/register', { method: 'POST', body: values }),
    onSuccess: (session) => queryClient.setQueryData(queryKeys.me, session),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
    // Drop every cached query so no household data survives on a shared device.
    onSettled: () => queryClient.clear(),
  });
}
