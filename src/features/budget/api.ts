import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Allocations, Budget, BudgetResponse, Recommendation, Session } from '@/types/api';
import type { HouseholdType } from '@/types/constants';

export function useRecommendation() {
  return useQuery({
    queryKey: queryKeys.recommendation,
    queryFn: () => api<Recommendation>('/budgets/recommendation'),
    staleTime: Infinity,
  });
}

export function useBudget(month: string) {
  return useQuery({
    queryKey: queryKeys.budget(month),
    queryFn: () => api<BudgetResponse>(`/budgets/${month}`),
  });
}

export type UpsertBudgetInput = {
  totalAmount: string;
  allocations: Allocations;
  targets: { categoryId: string; percent: number }[];
};

export function useUpsertBudget(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBudgetInput) =>
      api<{ budget: Budget }>(`/budgets/${month}`, { method: 'PUT', body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(month) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export type OnboardingInput = {
  mode: HouseholdType;
  familyName?: string;
  totalAmount: string;
  allocations: Allocations;
  targets: { investments: number; emergencyFund: number };
};

export function useOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OnboardingInput) => api<Session>('/household/onboarding', { method: 'POST', body: input }),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.me, session);
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
