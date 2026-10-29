// Copied from homewise-api/src/shared/constants.ts. Keep in sync.
export const ROLES = ['HEAD', 'MEMBER'] as const;
export type Role = (typeof ROLES)[number];

export const HOUSEHOLD_TYPES = ['PERSONAL', 'FAMILY'] as const;
export type HouseholdType = (typeof HOUSEHOLD_TYPES)[number];

export const BUCKETS = ['ESSENTIALS', 'LIFESTYLE', 'SAVINGS'] as const;
export type Bucket = (typeof BUCKETS)[number];

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
