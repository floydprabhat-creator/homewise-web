import { z } from 'zod';
import { earliestEntryDate, todayIST } from '@/lib/dates';
import { BILL_AMOUNT_TYPES, FREQUENCIES } from '@/types/constants';

// Mirrors homewise-api/src/modules/bills/bills.schemas.ts. The API is the real check.
const amountField = z
  .string()
  .transform((v) => v.replace(/,/g, '').trim())
  .pipe(
    z
      .string()
      .min(1, 'Enter an amount')
      .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Enter an amount with up to 2 decimals')
      .refine((v) => Number(v) > 0, 'Amount must be greater than zero'),
  );

export const billFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(80, 'Keep the name under 80 characters'),
  categoryId: z.string().min(1, 'Pick a category'),
  amountType: z.enum(BILL_AMOUNT_TYPES),
  amount: amountField,
  frequency: z.enum(FREQUENCIES),
  firstDueDate: z.string().min(1, 'Pick the first due date'),
  remindDaysBefore: z.coerce.number().int().min(1).max(7),
  /** '' in the select means the head pays; sent as null. */
  defaultAssigneeId: z.string().transform((v) => v || null),
});

export type BillFormInput = z.input<typeof billFormSchema>;
export type BillFormValues = z.output<typeof billFormSchema>;

export const payFormSchema = z.object({
  paidAmount: amountField,
  paidAt: z
    .string()
    .min(1, 'Pick a date')
    .refine((d) => d <= todayIST(), "Date can't be in the future")
    .refine((d) => d >= earliestEntryDate(), 'Payments can go back to the start of last month'),
});

export type PayFormInput = z.input<typeof payFormSchema>;
export type PayFormValues = z.output<typeof payFormSchema>;
