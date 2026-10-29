'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { useMe } from '@/features/auth/api';
import { useBudget, useRecommendation } from '@/features/budget/api';
import { BucketProgress } from '@/features/budget/components/bucket-progress';
import { BudgetEditor } from '@/features/budget/components/budget-editor';
import { SavingsTargets } from '@/features/budget/components/savings-targets';
import { UsageSummary } from '@/features/budget/components/usage-summary';
import { WarningsBanner } from '@/features/budget/components/warnings-banner';
import { useCategories } from '@/features/categories/api';
import { currentMonthIST } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatMonth } from '@/lib/format';

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
        <div className="flex flex-col gap-8">
          <section aria-label="This month so far" className="flex flex-col gap-4">
            <WarningsBanner usage={budget.data.usage} />
            <UsageSummary usage={budget.data.usage} />
            {budget.data.budget && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                {budget.data.usage.buckets
                  .filter((b) => b.bucket !== 'SAVINGS')
                  .map((b) => (
                    <BucketProgress key={b.bucket} bucket={b} />
                  ))}
                <SavingsTargets usage={budget.data.usage} />
              </div>
            )}
          </section>

          <section aria-labelledby="budget-split-title" className="flex flex-col gap-4 border-t border-border pt-8">
            <h2 id="budget-split-title" className="text-section font-bold">
              Amount and split
            </h2>
            <BudgetEditor
              key={month}
              month={month}
              budget={budget.data.budget}
              recommendation={recommendation.data}
              categories={categories.data}
              canEdit={isHead}
            />
          </section>
        </div>
      )}
    </>
  );
}
