import type { OccurrenceQuery, SpendingFilters } from '@/types/api';

export const queryKeys = {
  me: ['me'] as const,
  household: ['household'] as const,
  invites: ['household', 'invites'] as const,
  invitePreview: (token: string) => ['invite', token] as const,
  categories: (includeArchived = false) => ['categories', { includeArchived }] as const,
  recommendation: ['budget', 'recommendation'] as const,
  budget: (month: string) => ['budget', month] as const,
  spending: (filters: SpendingFilters) => ['spending', filters] as const,
  spendingAll: ['spending'] as const,
  spendingEntry: (id: string) => ['spending', 'entry', id] as const,
  bills: (includeArchived = false) => ['bills', { includeArchived }] as const,
  billsAll: ['bills'] as const,
  occurrences: (query: OccurrenceQuery) => ['occurrences', query] as const,
  occurrencesAll: ['occurrences'] as const,
  dashboard: ['dashboard'] as const,
  dashboardMonth: (month: string) => ['dashboard', month] as const,
};
