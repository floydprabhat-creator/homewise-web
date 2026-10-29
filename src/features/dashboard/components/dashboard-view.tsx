'use client';

import { PieChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { MonthPicker } from '@/components/layout/month-picker';
import { Alert } from '@/components/ui/alert';
import { buttonStyles } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/features/auth/api';
import { PayDialog } from '@/features/bills/components/pay-dialog';
import { UsageSummary } from '@/features/budget/components/usage-summary';
import { WarningsBanner } from '@/features/budget/components/warnings-banner';
import { currentMonthIST } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatMonth } from '@/lib/format';
import type { Occurrence } from '@/types/api';
import { useDashboard } from '../api';
import { BreakdownChart } from './breakdown-chart';
import { BucketCards } from './bucket-cards';
import { MonthComparison } from './month-comparison';
import { RecentSpending } from './recent-spending';
import { UpcomingBills } from './upcoming-bills';

function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
      {title && (
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(new Date()));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** Skeleton cards in the final layout, so the page doesn't jump when data arrives. */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading dashboard">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[124px]" />)}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[150px]" />)}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-4">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

const link = 'text-caption font-bold text-accent hover:underline';

export function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const latest = currentMonthIST();
  const raw = params.get('month');
  // The month lives in the URL (/dashboard?month=2026-09); no future months.
  const month = raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) && raw <= latest ? raw : latest;

  const { data: session } = useMe();
  const { data, error, isFetching } = useDashboard(month);
  const [paying, setPaying] = useState<Occurrence | null>(null);

  const setMonth = (m: string) => router.replace(m === latest ? pathname : `${pathname}?month=${m}`, { scroll: false });
  const viewer = session ? { userId: session.user.id, isHead: session.role === 'HEAD' } : null;
  const firstName = session?.user.name.split(' ')[0];
  const readOnly = data ? !data.isCurrentMonth : month !== latest;
  const monthLabel = formatMonth(month).split(' ')[0];

  const description = readOnly
    ? `Reviewing ${formatMonth(month)}. Earlier months are read-only.`
    : `${greeting()}${firstName ? `, ${firstName}` : ''}.${
        data?.daysLeft != null ? ` ${data.daysLeft === 0 ? 'Last day' : `${data.daysLeft} ${data.daysLeft === 1 ? 'day' : 'days'} left`} in ${monthLabel}.` : ''
      }`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={description}
        actions={<MonthPicker month={month} max={latest} onChange={setMonth} />}
      />

      {error ? (
        <Alert>{apiErrorMessage(error)}</Alert>
      ) : !data || !viewer ? (
        <DashboardSkeleton />
      ) : (
        <div className={isFetching && data.month !== month ? 'flex flex-col gap-6 opacity-60 transition-opacity' : 'flex flex-col gap-6'}>
          <WarningsBanner usage={data.usage} />

          {data.usage.totalBudget === null &&
            (viewer.isHead && !readOnly ? (
              <div className="rounded-[14px] border border-border bg-card">
                <EmptyState
                  icon={PieChart}
                  title={`Set your budget for ${monthLabel}`}
                  description="Spending is shown below. Set a budget to see what's left in each bucket."
                  action={
                    <Link href="/budget" className={buttonStyles()}>
                      Set budget
                    </Link>
                  }
                />
              </div>
            ) : (
              <Alert tone="brand" icon={PieChart}>
                {readOnly ? `No budget was set for ${formatMonth(month)}.` : 'Budget not set yet. The head of your household can set it.'}
              </Alert>
            ))}

          <UsageSummary usage={data.usage} />
          {data.usage.totalBudget !== null && <BucketCards usage={data.usage} />}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-4">
            <Panel title="Where the money went">
              {Number(data.usage.spent) > 0 ? (
                <BreakdownChart breakdown={data.breakdown} spent={data.usage.spent} />
              ) : (
                <div className="flex flex-col items-start gap-3 py-2">
                  <p className="text-caption text-muted-foreground">Nothing spent in {monthLabel} yet.</p>
                  {!readOnly && (
                    <Link href="/spending" className={link}>
                      Add spending
                    </Link>
                  )}
                </div>
              )}
            </Panel>
            <Panel
              title={readOnly ? `Bills in ${monthLabel}` : 'Upcoming and overdue bills'}
              action={
                <Link href="/bills" className={link}>
                  All bills
                </Link>
              }
            >
              <UpcomingBills bills={data.bills} viewer={viewer} readOnly={readOnly} onPay={setPaying} />
            </Panel>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-4">
            <Panel>
              <MonthComparison month={data.month} comparison={data.comparison} />
            </Panel>
            <Panel
              title="Recent spending"
              action={
                <Link href={readOnly ? `/spending?month=${month}` : '/spending'} className={link}>
                  See all
                </Link>
              }
            >
              <RecentSpending entries={data.recentSpending} userId={viewer.userId} />
            </Panel>
          </div>
        </div>
      )}

      <PayDialog occurrence={paying} onClose={() => setPaying(null)} />
    </>
  );
}
