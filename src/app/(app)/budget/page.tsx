'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { useMe } from '@/features/auth/api';
import { useBudget, useRecommendation } from '@/features/budget/api';
import { BudgetEditor } from '@/features/budget/components/budget-editor';
import { useCategories } from '@/features/categories/api';
import { currentMonthIST } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatMonth } from '@/lib/format';

// Usage per bucket (spent vs quota) arrives with budget tracking (F7).
export default function BudgetPage() {
  const month = currentMonthIST();
  const { data: session } = useMe();
  const budget = useBudget(month);
  const recommendation = useRecommendation();
  const categories = useCategories();
  const isHead = session?.role === 'HEAD';

  const error = budget.error ?? recommendation.error ?? categories.error;
  const ready = budget.data && recommendation.data && categories.data && session;

  return (
    <>
      <PageHeader
        title="Budget"
        description={`${formatMonth(month)}${isHead ? ' · Change the amount or split any time this month' : ''}`}
      />
      {error ? (
        <Alert>{apiErrorMessage(error)}</Alert>
      ) : !ready ? (
        <div className="flex justify-center py-16 text-accent">
          <Spinner className="size-6" />
        </div>
      ) : (
        <BudgetEditor
          key={month}
          month={month}
          budget={budget.data.budget}
          recommendation={recommendation.data}
          categories={categories.data}
          canEdit={isHead}
        />
      )}
    </>
  );
}
