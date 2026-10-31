'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AffixInput } from '@/components/ui/affix-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormField } from '@/components/ui/form-field';
import { Select } from '@/components/ui/select';
import { useCategories } from '@/features/categories/api';
import { CategoryPicker } from '@/features/categories/components/category-picker';
import { todayIST } from '@/lib/dates';
import { applyApiErrors } from '@/lib/form-errors';
import type { Bill, Member } from '@/types/api';
import { FREQUENCIES, FREQUENCY_LABELS } from '@/types/constants';
import { useCreateBill, useUpdateBill } from '../api';
import { billFormSchema, type BillFormInput, type BillFormValues } from '../schemas';

const FIELDS = [
  'name',
  'categoryId',
  'amountType',
  'amount',
  'frequency',
  'firstDueDate',
  'remindDaysBefore',
  'defaultAssigneeId',
] as const;

type BillFormProps = {
  /** Omit to create a new bill. */
  bill?: Bill;
  members: Member[];
  onSaved: () => void;
  onCancel: () => void;
};

export function BillForm({ bill, members, onSaved, onCancel }: BillFormProps) {
  const { data: categories = [] } = useCategories();
  const create = useCreateBill();
  const update = useUpdateBill();
  const [formError, setFormError] = useState<string | null>(null);
  const head = members.find((m) => m.role === 'HEAD');

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BillFormInput, unknown, BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: bill
      ? {
          name: bill.name,
          categoryId: bill.category.id,
          amountType: bill.amountType,
          amount: String(Number(bill.amount)),
          frequency: bill.frequency,
          firstDueDate: bill.firstDueDate,
          remindDaysBefore: bill.remindDaysBefore,
          defaultAssigneeId: bill.defaultAssigneeId ?? '',
        }
      : {
          name: '',
          categoryId: '',
          amountType: 'FIXED',
          amount: '',
          frequency: 'MONTHLY',
          firstDueDate: todayIST(),
          remindDaysBefore: 3,
          defaultAssigneeId: '',
        },
  });
  const amountType = useWatch({ control, name: 'amountType' });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const onError = (error: Error) => setFormError(applyApiErrors(error, setError, FIELDS));
    if (bill) {
      // Frequency and first due date are fixed after creation, so they aren't sent.
      const { name, categoryId, amountType, amount, remindDaysBefore, defaultAssigneeId } = values;
      update.mutate(
        { id: bill.id, name, categoryId, amountType, amount, remindDaysBefore, defaultAssigneeId },
        { onSuccess: onSaved, onError },
      );
    } else {
      create.mutate(values, { onSuccess: onSaved, onError });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError && <Alert>{formError}</Alert>}

      <FormField id="bill-name" label="Name" maxLength={80} placeholder="e.g. Electricity" autoFocus={!bill} error={errors.name?.message} {...register('name')} />

      <Field id="bill-category" label="Category" error={errors.categoryId?.message}>
        {(fieldControl) => (
          <CategoryPicker {...fieldControl} categories={categories} current={bill?.category} {...register('categoryId')} />
        )}
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="bill-amount-type" label="Amount type" error={errors.amountType?.message}>
          {(fieldControl) => (
            <Select {...fieldControl} {...register('amountType')}>
              <option value="FIXED">Fixed</option>
              <option value="VARIABLE">Varies</option>
            </Select>
          )}
        </Field>
        <Field id="bill-amount" label={amountType === 'VARIABLE' ? 'Estimate' : 'Amount'}
          hint={amountType === 'VARIABLE' ? 'Enter the actual amount each time' : undefined} error={errors.amount?.message}>
          {(fieldControl) => <AffixInput {...fieldControl} prefix="₹" inputMode="decimal" placeholder="0" {...register('amount')} />}
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id="bill-frequency"
          label="Repeats"
          hint={bill ? "Can't change after creation" : undefined}
          error={errors.frequency?.message}
        >
          {(fieldControl) => (
            <Select {...fieldControl} disabled={Boolean(bill)} {...register('frequency')}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <FormField
          id="bill-first-due"
          label="First due date"
          type="date"
          disabled={Boolean(bill)}
          error={errors.firstDueDate?.message}
          {...register('firstDueDate')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="bill-remind" label="Remind before due" error={errors.remindDaysBefore?.message}>
          {(fieldControl) => (
            <Select {...fieldControl} {...register('remindDaysBefore')}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'day' : 'days'}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field id="bill-assignee" label="Usually paid by" hint="You can change who pays any single month later" error={errors.defaultAssigneeId?.message}>
          {(fieldControl) => (
            <Select {...fieldControl} {...register('defaultAssigneeId')}>
              <option value="">{head ? `${head.name} (head)` : 'Head'}</option>
              {members
                .filter((m) => m.role !== 'HEAD')
                .map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
            </Select>
          )}
        </Field>

      {bill && (
        <p className="text-xs text-muted-foreground">Changes apply to upcoming bills that haven&apos;t been created yet.</p>
      )}

      <div className="mt-1 flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-2" loading={create.isPending || update.isPending}>
          {bill ? 'Save changes' : 'Create bill'}
        </Button>
      </div>
    </form>
  );
}
