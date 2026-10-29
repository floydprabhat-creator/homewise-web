'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatINR } from '@/lib/format';
import type { Budget, Category, Recommendation } from '@/types/api';
import { BUCKETS } from '@/types/constants';
import { useUpsertBudget } from '../api';
import { allocationsToNumbers, checkAmount, checkSplit, normalizeAmount, type SplitDraft } from '../schemas';
import { BudgetAmountField } from './budget-amount-step';
import { SplitEditor } from './split-editor';

type Initial = { amount: string; split: SplitDraft };

/** The month's budget, or the recommended split when none exists yet; targets are keyed by category ID. */
function initialValues(budget: Budget | null, recommendation: Recommendation, categories: Category[]): Initial {
  if (budget) {
    return {
      amount: String(Number(budget.totalAmount)),
      split: {
        allocations: Object.fromEntries(BUCKETS.map((b) => [b, String(budget.allocations[b])])) as SplitDraft['allocations'],
        targets: budget.targets.map((t) => ({ key: t.categoryId, name: t.name, percent: String(t.percent) })),
      },
    };
  }
  return {
    amount: '',
    split: {
      allocations: Object.fromEntries(BUCKETS.map((b) => [b, String(recommendation.allocations[b])])) as SplitDraft['allocations'],
      targets: recommendation.targets.flatMap((t) => {
        const category = categories.find((c) => c.name === t.categoryName && c.bucket === 'SAVINGS');
        return category ? [{ key: category.id, name: category.name, percent: String(t.percent) }] : [];
      }),
    },
  };
}

type BudgetEditorProps = {
  month: string;
  budget: Budget | null;
  recommendation: Recommendation;
  categories: Category[];
  canEdit: boolean;
};

export function BudgetEditor({ month, budget, recommendation, categories, canEdit }: BudgetEditorProps) {
  const upsert = useUpsertBudget(month);
  const [initial, setInitial] = useState(() => initialValues(budget, recommendation, categories));
  const [amount, setAmount] = useState(initial.amount);
  const [split, setSplit] = useState(initial.split);
  const [showErrors, setShowErrors] = useState(false);
  const [saved, setSaved] = useState(false);

  const amountError = checkAmount(amount);
  const check = checkSplit(split);
  const dirty = amount !== initial.amount || JSON.stringify(split) !== JSON.stringify(initial.split);

  if (!canEdit) {
    if (!budget) {
      return (
        <Card>
          <p className="text-muted-foreground">The head of your household hasn&apos;t set this month&apos;s budget yet.</p>
        </Card>
      );
    }
    return (
      <div className="flex flex-col gap-6">
        <p className="text-figure font-extrabold tracking-tight">{formatINR(budget.totalAmount)}</p>
        <SplitEditor totalAmount={budget.totalAmount} draft={initial.split} check={checkSplit(initial.split)} />
      </div>
    );
  }

  function save() {
    setShowErrors(true);
    setSaved(false);
    if (amountError || !check.valid) return;
    upsert.mutate(
      {
        totalAmount: normalizeAmount(amount),
        allocations: allocationsToNumbers(split.allocations),
        targets: split.targets
          .filter((t) => Number(t.percent || 0) > 0)
          .map((t) => ({ categoryId: t.key, percent: Number(t.percent) })),
      },
      {
        onSuccess: () => {
          setInitial({ amount, split });
          setShowErrors(false);
          setSaved(true);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {!budget && (
        <Alert tone="brand">No budget is set for this month yet. Start from the recommended split and save it.</Alert>
      )}
      <div className="max-w-sm">
        <BudgetAmountField
          value={amount}
          onChange={(v) => {
            setAmount(v);
            setSaved(false);
          }}
          error={showErrors ? amountError : undefined}
        />
      </div>
      <SplitEditor
        totalAmount={amountError ? '0' : normalizeAmount(amount)}
        draft={split}
        check={check}
        onChange={(s) => {
          setSplit(s);
          setSaved(false);
        }}
      />
      {upsert.isError && <Alert>{apiErrorMessage(upsert.error)}</Alert>}
      {saved && !dirty && (
        <Alert tone="success" icon={Check}>
          Budget saved.
        </Alert>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="secondary"
          size="lg"
          disabled={!dirty}
          onClick={() => {
            setAmount(initial.amount);
            setSplit(initial.split);
            setShowErrors(false);
          }}
        >
          Discard changes
        </Button>
        <Button size="lg" disabled={!dirty || !check.valid} loading={upsert.isPending} onClick={save}>
          Save budget
        </Button>
      </div>
    </div>
  );
}
