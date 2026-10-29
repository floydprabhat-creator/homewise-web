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
import { Modal } from '@/components/ui/modal';
import { UsagePreview } from '@/features/budget/components/usage-preview';
import { earliestEntryDate, todayIST } from '@/lib/dates';
import { applyApiErrors } from '@/lib/form-errors';
import { formatDate, formatINR } from '@/lib/format';
import type { FailedFile, Occurrence } from '@/types/api';
import { BUCKET_INFO } from '@/types/constants';
import { usePayOccurrence } from '../api';
import { payFormSchema, type PayFormInput, type PayFormValues } from '../schemas';

const FIELDS = ['paidAmount', 'paidAt'] as const;

type PayFormProps = {
  occurrence: Occurrence;
  onPaid: (failedFiles: FailedFile[]) => void;
  onCancel: () => void;
};

/** Amount prefilled with the amount due, date with today, optional receipt. */
export function PayForm({ occurrence, onPaid, onCancel }: PayFormProps) {
  const pay = usePayOccurrence();
  const [receipt, setReceipt] = useState<File[]>([]);
  const [receiptError, setReceiptError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PayFormInput, unknown, PayFormValues>({
    resolver: zodResolver(payFormSchema),
    defaultValues: { paidAmount: String(Number(occurrence.amountDue)), paidAt: todayIST() },
  });
  const [typed, paidAt] = useWatch({ control, name: ['paidAmount', 'paidAt'] });
  const amount = Number(String(typed).replace(/,/g, ''));

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    pay.mutate(
      { id: occurrence.id, values, receipt: receipt[0] },
      {
        onSuccess: ({ failedFiles }) => onPaid(failedFiles),
        onError: (error) => {
          const message = applyApiErrors(error, setError, FIELDS);
          if (message && /file|receipt/i.test(message)) setReceiptError(message);
          else setFormError(message);
        },
      },
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError && <Alert>{formError}</Alert>}

      <Field
        id={`pay-amount-${occurrence.id}`}
        label="Amount paid"
        hint={occurrence.bill.amountType === 'VARIABLE' ? "Variable bill: enter the amount on this month's bill" : undefined}
        error={errors.paidAmount?.message}
      >
        {(fieldControl) => (
          <AffixInput {...fieldControl} prefix="₹" emphasis inputMode="decimal" autoFocus {...register('paidAmount')} />
        )}
      </Field>

      <FormField
        id={`pay-date-${occurrence.id}`}
        label="Paid on"
        type="date"
        min={earliestEntryDate()}
        max={todayIST()}
        error={errors.paidAt?.message}
        {...register('paidAt')}
      />

      <FilePicker
        label="Receipt (optional)"
        files={receipt}
        onChange={(files) => {
          setReceipt(files);
          setReceiptError(undefined);
        }}
        max={1}
        error={receiptError}
        onError={setReceiptError}
      />

      {amount > 0 && (
        <UsagePreview
          month={paidAt.slice(0, 7)}
          bucket={occurrence.category.bucket}
          amount={amount}
          lead={`Adds ${formatINR(amount)} to ${BUCKET_INFO[occurrence.category.bucket].label} as ${occurrence.category.name} spending.`}
        />
      )}

      <div className="flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-[2]" loading={pay.isPending}>
          Confirm payment
        </Button>
      </div>
    </form>
  );
}

type PayDialogProps = {
  occurrence: Occurrence | null;
  onClose: () => void;
  onPaid?: (failedFiles: FailedFile[]) => void;
};

/** The pay form in a modal, for paying from the dashboard. */
export function PayDialog({ occurrence, onClose, onPaid }: PayDialogProps) {
  return (
    <Modal open={Boolean(occurrence)} onClose={onClose} title={occurrence ? `Mark ${occurrence.bill.name} paid` : 'Mark paid'}>
      {occurrence && (
        <div className="flex flex-col gap-4 text-foreground">
          <p className="text-caption text-muted-foreground">
            Due {formatDate(occurrence.dueDate)} · {occurrence.bill.amountType === 'VARIABLE' ? 'estimate ' : ''}
            {formatINR(occurrence.amountDue)}
          </p>
          <PayForm
            key={occurrence.id}
            occurrence={occurrence}
            onCancel={onClose}
            onPaid={(failed) => {
              onPaid?.(failed);
              onClose();
            }}
          />
        </div>
      )}
    </Modal>
  );
}
