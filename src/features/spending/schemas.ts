import { z } from 'zod';
import { earliestEntryDate, todayIST } from '@/lib/dates';

// Mirrors homewise-api/src/modules/transactions/transactions.schemas.ts. The API is the real check.
export const spendingFormSchema = z.object({
  amount: z
    .string()
    .transform((v) => v.replace(/,/g, '').trim())
    .pipe(
      z
        .string()
        .min(1, 'Enter an amount')
        .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter an amount with up to 2 decimals')
        .refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
    ),
  categoryId: z.string().min(1, 'Pick a category'),
  date: z
    .string()
    .min(1, 'Pick a date')
    .refine((d) => d <= todayIST(), "Date can't be in the future")
    .refine((d) => d >= earliestEntryDate(), 'Entries can go back to the start of last month'),
  note: z.string().trim().max(200, 'Keep the note under 200 characters'),
});

export type SpendingFormInput = z.input<typeof spendingFormSchema>;
export type SpendingFormValues = z.output<typeof spendingFormSchema>;
