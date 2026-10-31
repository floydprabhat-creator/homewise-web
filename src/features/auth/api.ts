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

/** Forgot password, logged out. The answer is the same whether or not the email has an account. */
export function useSendResetCode() {
  return useMutation({
    mutationFn: (email: string) => api<{ sentTo: string }>('/auth/password-reset/code', { method: 'POST', body: { email } }),
  });
}

/** Sets the new password and signs this device in; every other device is signed out. */
export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; code: string; newPassword: string }) =>
      api<Session>('/auth/password-reset', { method: 'POST', body: input }),
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
