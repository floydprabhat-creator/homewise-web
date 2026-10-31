'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AffixInput } from '@/components/ui/affix-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FilePicker } from '@/components/ui/file-picker';
import { FormField } from '@/components/ui/form-field';
import { PayDialog } from '@/features/bills/components/pay-dialog';
import { UnpaidBillNote } from '@/features/bills/components/unpaid-bill-note';
import { UsagePreview } from '@/features/budget/components/usage-preview';
import { useCategories } from '@/features/categories/api';
import { CategoryPicker } from '@/features/categories/components/category-picker';
import { earliestEntryDate, todayIST } from '@/lib/dates';
import { applyApiErrors } from '@/lib/form-errors';
import type { FailedFile, Occurrence, SpendingEntryDetail } from '@/types/api';
import { MAX_FILES_PER_ENTRY } from '@/types/constants';
import { useCreateSpending, useUpdateSpending } from '../api';
import { spendingFormSchema, type SpendingFormInput, type SpendingFormValues } from '../schemas';

type SpendingFormProps = {
  /** Omit to add a new entry. */
  entry?: SpendingEntryDetail;
  onSaved: (entryId: string, failedFiles: FailedFile[]) => void;
  onCancel: () => void;
};

const FIELDS = ['amount', 'categoryId', 'date', 'note'] as const;

export function SpendingForm({ entry, onSaved, onCancel }: SpendingFormProps) {
  const { data: categories = [] } = useCategories();
  const create = useCreateSpending();
  const update = useUpdateSpending();
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [payingBill, setPayingBill] = useState<Occurrence | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SpendingFormInput, unknown, SpendingFormValues>({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: entry
      ? { amount: String(Number(entry.amount)), categoryId: entry.category.id, date: entry.date, note: entry.note ?? '' }
      : { amount: '', categoryId: '', date: todayIST(), note: '' },
  });

  // Preview against the month the entry is dated in; when editing, the original amount is taken out first.
  const [typedAmount, categoryId, date] = useWatch({ control, name: ['amount', 'categoryId', 'date'] });
  const bucket = categories.find((c) => c.id === categoryId)?.bucket;
  const month = (date || todayIST()).slice(0, 7);
  const removed = entry && entry.date.startsWith(month) && entry.category.bucket === bucket ? Number(entry.amount) : 0;

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    const onError = (error: Error) => {
      const message = applyApiErrors(error, setError, FIELDS);
      // File problems come back under "files", which isn't a form field.
      if (message && /file/i.test(message)) setFilesError(message);
      else setFormError(message);
    };
    if (entry) {
      update.mutate({ id: entry.id, values }, { onSuccess: () => onSaved(entry.id, []), onError });
    } else {
      create.mutate(
        { values, files },
        { onSuccess: ({ transaction, failedFiles }) => onSaved(transaction.id, failedFiles), onError },
      );
    }
  });

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <Alert>{formError}</Alert>}

        <Field id="spending-amount" label="Amount" error={errors.amount?.message}>
          {(control) => (
            <AffixInput {...control} prefix="₹" emphasis inputMode="decimal" placeholder="0" autoFocus={!entry} {...register('amount')} />
          )}
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="spending-category" label="Category" error={errors.categoryId?.message}>
            {(control) => (
              <CategoryPicker
                {...control}
                categories={categories}
                current={entry?.category}
                {...register('categoryId')}
              />
            )}
          </Field>
          <FormField
            id="spending-date"
            label="Date"
            type="date"
            min={earliestEntryDate()}
            max={todayIST()}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        {!entry && categoryId && <UnpaidBillNote categoryId={categoryId} date={date || todayIST()} onPay={setPayingBill} />}

        <FormField id="spending-note" label="Note" aside="Optional" maxLength={200} placeholder="e.g. Birthday cake" error={errors.note?.message} {...register('note')} />

        <UsagePreview month={month} bucket={bucket} amount={Number(String(typedAmount).replace(/,/g, ''))} removed={removed} />

        {!entry && (
          <FilePicker
            label="Bill photo or PDF"
            files={files}
            onChange={(f) => {
              setFiles(f);
              setFilesError(undefined);
            }}
            max={MAX_FILES_PER_ENTRY}
            error={filesError}
            onError={setFilesError}
          />
        )}

        <div className="mt-1 flex gap-2.5">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-2" loading={create.isPending || update.isPending}>
            {entry ? 'Save changes' : 'Save entry'}
          </Button>
        </div>
      </form>

      {/* Outside the form: the pay form is a <form> of its own. Paying records the spending, so this form closes. */}
      <PayDialog occurrence={payingBill} onClose={() => setPayingBill(null)} onPaid={onCancel} />
    </>
  );
}
