import type {
  BillAmountType,
  BillStatus,
  Bucket,
  DisplayStatus,
  Frequency,
  HouseholdType,
  OccurrenceStatus,
  Role,
} from './constants';

export type User = {
  id: string;
  name: string;
  email: string;
  /** Null means "show initials". */
  avatarUrl: string | null;
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
  avatarUrl: string | null;
  role: Role;
  joinedAt: string;
};

export type HouseholdResponse = { household: HouseholdSummary; members: Member[] };

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

/** An invite as the head sees it on the family page. */
export type Invite = { id: string; email: string; name: string | null; status: InviteStatus; expiresAt: string; createdAt: string; updatedAt: string };

/** GET /invites/:token, public. */
export type InvitePreview = { familyName: string; inviterName: string; email: string; name: string | null; status: InviteStatus; expiresAt: string };

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

export type BucketState = 'OK' | 'WARNING' | 'EXCEEDED' | 'TARGET_REACHED';

/** Every usage figure for a month, from usage.service.getBudgetUsage() in the API. */
export type BudgetUsage = {
  month: string;
  totalBudget: string | null;
  spent: string;
  remaining: string | null;
  committed: string;
  committedCount: number;
  available: string | null;
  percentUsed: number | null;
  state: 'OK' | 'WARNING' | 'EXCEEDED';
  buckets: {
    bucket: Bucket;
    percentAllocated: number;
    limit: string;
    spent: string;
    percentOfQuota: number | null;
    state: BucketState;
  }[];
  targets: {
    categoryId: string;
    categoryName: string;
    targetPercent: number;
    actualPercent: number;
    spent: string;
    reached: boolean;
  }[];
};

export type BudgetResponse = { month: string; budget: Budget | null; usage: BudgetUsage };

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

/** A bill template (Manage bills tab). */
export type Bill = {
  id: string;
  name: string;
  amountType: BillAmountType;
  amount: string;
  frequency: Frequency;
  firstDueDate: string;
  remindDaysBefore: number;
  status: BillStatus;
  category: { id: string; name: string; bucket: Bucket };
  defaultAssigneeId: string | null;
  defaultAssigneeName: string | null;
  nextDueDate: string | null;
  nextAmountDue: string | null;
};

/** One period of a bill, with its calculated status and the person responsible. */
export type Occurrence = {
  id: string;
  dueDate: string;
  amountDue: string;
  assigneeId: string | null;
  status: OccurrenceStatus;
  paidAmount: string | null;
  paidAt: string | null;
  paidBy: { id: string; name: string } | null;
  bill: {
    id: string;
    name: string;
    frequency: Frequency;
    amountType: BillAmountType;
    remindDaysBefore: number;
    status: BillStatus;
  };
  category: { id: string; name: string; bucket: Bucket };
  transactionId: string | null;
  receiptCount: number;
  displayStatus: DisplayStatus;
  responsibleUserId: string | null;
  responsibleName: string;
  isAssignedToHead: boolean;
};

/** GET /dashboard: every widget for one month. */
export type DashboardResponse = {
  month: string;
  isCurrentMonth: boolean;
  daysLeft: number | null;
  usage: BudgetUsage;
  breakdown: {
    bucket: Bucket;
    spent: string;
    categories: { categoryId: string; name: string; spent: string }[];
  }[];
  comparison: {
    previousMonth: string;
    total: { current: string; previous: string; changePercent: number | null };
    buckets: { bucket: Bucket; current: string; previous: string; changePercent: number | null }[];
  } | null;
  bills: Occurrence[];
  recentSpending: Omit<SpendingEntry, 'attachmentCount'>[];
  warnings: { scope: Bucket | 'OVERALL'; state: 'WARNING' | 'EXCEEDED' }[];
};

export type OccurrenceQuery = {
  from?: string;
  to?: string;
  status?: OccurrenceStatus;
  includeOverdue?: boolean;
  billId?: string;
};

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  /** In-app path, e.g. /bills. */
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationList = { items: AppNotification[]; unreadCount: number; page: number; pageSize: number };

/** POST /scan: suggested form values read from a bill photo or PDF. Null when the bill doesn't clearly show it. */
export type ScannedBill = {
  readable: boolean;
  merchant: string | null;
  amount: string | null;
  date: string | null;
  dueDate: string | null;
  categoryId: string | null;
  frequency: Frequency | null;
  note: string | null;
};

/** POST /budgets/advice: the budget assistant's questions, plus change requests after a first suggestion. */
export type BudgetAdviceRequest = {
  answers: {
    monthlyIncome: string;
    householdSize: '1' | '2' | '3-4' | '5+';
    housingCost: string;
    otherEmis: string;
    emergencySavings: 'NONE' | 'UNDER_3_MONTHS' | '3_TO_6_MONTHS' | 'OVER_6_MONTHS';
    goal: 'EMERGENCY_FUND' | 'HOME' | 'RETIREMENT' | 'CHILD_EDUCATION' | 'TRAVEL' | 'DEBT_FREE';
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  requests: string[];
  current?: { allocations: Record<Bucket, number>; targets: { categoryId: string; percent: number }[] };
};

/** A suggested split, already checked by the API against the budget rules. */
export type BudgetAdvice = {
  allocations: Record<Bucket, number>;
  targets: { categoryId: string; name: string; percent: number }[];
  summary: string;
  investing: { type: string; note: string }[];
  /** The answer to the latest change request, if there was one. */
  reply: string | null;
};
