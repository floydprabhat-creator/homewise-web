import type { Bucket, HouseholdType, Role } from './constants';

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type HouseholdSummary = {
  id: string;
  name: string;
  type: HouseholdType;
};

/** Returned by /auth/register, /auth/login, /auth/me and /household/onboarding. */
export type Session = {
  user: User;
  household: HouseholdSummary | null;
  role: Role | null;
  needsOnboarding: boolean;
};

export type Member = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
};

export type HouseholdResponse = { household: HouseholdSummary; members: Member[] };

export type Category = {
  id: string;
  name: string;
  bucket: Bucket;
  isSystem: boolean;
  archivedAt: string | null;
};

export type Allocations = Record<Bucket, number>;

export type Budget = {
  id: string;
  month: string;
  totalAmount: string;
  allocations: Allocations;
  targets: { categoryId: string; name: string; bucket: Bucket; percent: number }[];
  updatedAt: string;
};

export type BudgetResponse = { month: string; budget: Budget | null; usage: null };

export type Recommendation = {
  allocations: Allocations;
  targets: { categoryName: string; percent: number }[];
};

export type Attachment = {
  id: string;
  contentType: string;
  sizeBytes: number;
  originalName: string;
  createdAt: string;
};

export type SpendingEntry = {
  id: string;
  amount: string;
  date: string;
  note: string | null;
  isBillPayment: boolean;
  createdAt: string;
  category: { id: string; name: string; bucket: Bucket };
  recordedBy: { id: string; name: string; isFormerMember: boolean };
  attachmentCount: number;
};

export type SpendingEntryDetail = Omit<SpendingEntry, 'attachmentCount'> & { attachments: Attachment[] };

export type SpendingList = {
  month: string;
  items: SpendingEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalAmount: string;
};

export type SpendingFilters = {
  month: string;
  page: number;
  bucket?: Bucket;
  recordedBy?: string;
  hasAttachment?: boolean;
  q?: string;
};

export type FailedFile = { name: string; reason: string };

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
