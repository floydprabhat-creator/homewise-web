'use client';

import { AffixInput } from '@/components/ui/affix-input';
import { FieldError } from '@/components/ui/field-error';

type BudgetAmountFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  autoFocus?: boolean;
};

/** The ₹ amount input used by onboarding and the budget page. */
export function BudgetAmountField({ value, onChange, error, label = 'Monthly budget', autoFocus }: BudgetAmountFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="budget-amount" className="text-caption font-semibold">
        {label}
      </label>
      <AffixInput
        id="budget-amount"
        prefix="₹"
        emphasis
        inputMode="decimal"
        placeholder="60,000"
        autoFocus={autoFocus}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'budget-amount-error' : 'budget-amount-hint'}
        onChange={(e) => {
          if (/^[\d,]*(\.\d{0,2})?$/.test(e.target.value)) onChange(e.target.value);
        }}
      />
      {error ? (
        <FieldError id="budget-amount-error" message={error} />
      ) : (
        <p id="budget-amount-hint" className="text-xs text-muted-foreground">
          Everything your household plans to spend and save in a month.
        </p>
      )}
    </div>
  );
}
