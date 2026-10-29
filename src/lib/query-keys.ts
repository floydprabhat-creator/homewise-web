import type { SpendingFilters } from '@/types/api';

export const queryKeys = {
  me: ['me'] as const,
  household: ['household'] as const,
  categories: (includeArchived = false) => ['categories', { includeArchived }] as const,
  recommendation: ['budget', 'recommendation'] as const,
  budget: (month: string) => ['budget', month] as const,
  spending: (filters: SpendingFilters) => ['spending', filters] as const,
  spendingAll: ['spending'] as const,
  spendingEntry: (id: string) => ['spending', 'entry', id] as const,
  dashboard: ['dashboard'] as const,
};
