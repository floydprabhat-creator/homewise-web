// Copied from homewise-api/src/shared/constants.ts. Keep in sync.
export const ROLES = ['HEAD', 'MEMBER'] as const;
export type Role = (typeof ROLES)[number];

export const HOUSEHOLD_TYPES = ['PERSONAL', 'FAMILY'] as const;
export type HouseholdType = (typeof HOUSEHOLD_TYPES)[number];

export const BUCKETS = ['ESSENTIALS', 'LIFESTYLE', 'SAVINGS'] as const;
export type Bucket = (typeof BUCKETS)[number];

export const FREQUENCIES = ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const BILL_AMOUNT_TYPES = ['FIXED', 'VARIABLE'] as const;
export type BillAmountType = (typeof BILL_AMOUNT_TYPES)[number];

export type BillStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type OccurrenceStatus = 'UNPAID' | 'PAID';
/** Calculated by the API from IST today; never stored. */
export type DisplayStatus = 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'PAID';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  ONE_TIME: 'One time',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

export const SESSION_COOKIE = 'hw_session';

// Mirrors the API's MAX_FILE_BYTES, MAX_FILES_PER_ENTRY and ALLOWED_FILE_TYPES.
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_ENTRY = 3;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const BUCKET_INFO: Record<Bucket, { label: string; description: string; dot: string; bar: string }> = {
  ESSENTIALS: {
    label: 'Essentials',
    description: 'Groceries, electricity, rent, school fees, recharges',
    dot: 'bg-bucket-essentials',
    bar: 'bg-bucket-essentials',
  },
  LIFESTYLE: {
    label: 'Lifestyle',
    description: 'Travel, shopping, dining out, entertainment',
    dot: 'bg-bucket-lifestyle',
    bar: 'bg-bucket-lifestyle',
  },
  SAVINGS: {
    label: 'Savings',
    description: 'Money set aside, recorded like any entry',
    dot: 'bg-bucket-savings',
    bar: 'bg-bucket-savings',
  },
};
