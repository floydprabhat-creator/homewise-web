'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Stepper } from '@/components/ui/stepper';
import { ModeChoice } from '@/features/household/components/mode-choice';
import { apiErrorMessage } from '@/lib/form-errors';
import { ApiError } from '@/lib/api-client';
import { currentMonthIST } from '@/lib/dates';
import { formatINR, formatMonth } from '@/lib/format';
import type { Recommendation } from '@/types/api';
import { BUCKETS, type HouseholdType } from '@/types/constants';
import { useOnboarding } from '../api';
import { allocationsToNumbers, checkAmount, checkSplit, normalizeAmount, type SplitDraft } from '../schemas';
import { BudgetAmountField } from './budget-amount-step';
import { SplitEditor } from './split-editor';

const STEPS = ['Household', 'Monthly budget', 'Split'];
const TARGET_KEYS: Record<string, 'investments' | 'emergencyFund'> = {
  Investments: 'investments',
  'Emergency fund': 'emergencyFund',
};

type Draft = {
  step: number;
  mode: HouseholdType | null;
  familyName: string;
  amount: string;
  split: SplitDraft;
};

const storageKey = (userId: string) => `hw-onboarding:${userId}`;

export function recommendedSplit(rec: Recommendation): SplitDraft {
  return {
    allocations: Object.fromEntries(BUCKETS.map((b) => [b, String(rec.allocations[b])])) as SplitDraft['allocations'],
    targets: rec.targets.map((t) => ({ key: t.categoryName, name: t.categoryName, percent: String(t.percent) })),
  };
}

// Unfinished steps live in the browser, so a reload or a later visit resumes where the user left off.
function loadDraft(userId: string, rec: Recommendation): Draft {
  const fresh: Draft = { step: 0, mode: null, familyName: '', amount: '', split: recommendedSplit(rec) };
  try {
    const saved = localStorage.getItem(storageKey(userId));
    return saved ? { ...fresh, ...(JSON.parse(saved) as Partial<Draft>) } : fresh;
  } catch {
    return fresh;
  }
}

export function OnboardingFlow({ userId, recommendation }: { userId: string; recommendation: Recommendation }) {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [draft, setDraft] = useState(() => loadDraft(userId, recommendation));
  const [showErrors, setShowErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [familyNameError, setFamilyNameError] = useState<string>();

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(draft));
    } catch {
      // Storage unavailable (private mode): the flow still works, it just won't resume.
    }
  }, [draft, userId]);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const goTo = (step: number) => {
    setShowErrors(false);
    setFormError(null);
    update({ step });
    window.scrollTo({ top: 0 });
  };

  const month = currentMonthIST();
  const amountError = checkAmount(draft.amount);
  const split = checkSplit(draft.split);
  const householdLabel = draft.mode === 'FAMILY' ? draft.familyName.trim() || 'Your family' : 'Just me';

  function continueFromMode() {
    const nameMissing = draft.mode === 'FAMILY' && !draft.familyName.trim();
    setFamilyNameError(nameMissing ? 'Enter a family name' : undefined);
    if (!draft.mode || nameMissing) return setShowErrors(true);
    goTo(1);
  }

  function save() {
    setFormError(null);
    const targets = Object.fromEntries(
      draft.split.targets.map((t) => [TARGET_KEYS[t.name] ?? t.key, Number(t.percent || 0)]),
    ) as { investments: number; emergencyFund: number };

    onboarding.mutate(
      {
        mode: draft.mode!,
        familyName: draft.mode === 'FAMILY' ? draft.familyName.trim() : undefined,
        totalAmount: normalizeAmount(draft.amount),
        allocations: allocationsToNumbers(draft.split.allocations),
        targets,
      },
      {
        onSuccess: () => {
          localStorage.removeItem(storageKey(userId));
          router.replace('/dashboard');
        },
        onError: (error) => {
          // Already onboarded in another tab: nothing to save here.
          if (error instanceof ApiError && error.code === 'ALREADY_IN_HOUSEHOLD') return router.replace('/dashboard');
          setFormError(apiErrorMessage(error));
        },
      },
    );
  }

  return (
    <>
      <Header>
        <Stepper steps={STEPS} current={draft.step} />
      </Header>

      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-8 px-4 pt-12 pb-14 sm:px-6">
        {draft.step === 0 && (
          <section className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <StepHeading eyebrow="Step 1 of 3" title="Who is this budget for?" description="You can turn a personal budget into a family one later." />
            <ModeChoice value={draft.mode} onChange={(mode) => update({ mode })} />
            {showErrors && !draft.mode && <Alert>Choose &ldquo;Just me&rdquo; or &ldquo;My family&rdquo; to continue.</Alert>}
            {draft.mode === 'FAMILY' && (
              <FormField
                id="family-name"
                label="Family name"
                placeholder="Sharma family"
                maxLength={80}
                autoComplete="off"
                value={draft.familyName}
                error={familyNameError}
                onChange={(e) => {
                  update({ familyName: e.target.value });
                  if (familyNameError) setFamilyNameError(undefined);
                }}
              />
            )}
            <div className="flex justify-end">
              <Button size="lg" onClick={continueFromMode}>
                Continue
              </Button>
            </div>
          </section>
        )}

        {draft.step === 1 && (
          <form
            className="mx-auto flex w-full max-w-2xl flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (amountError) return setShowErrors(true);
              goTo(2);
            }}
            noValidate
          >
            <StepHeading
              eyebrow={`${householdLabel} · ${formatMonth(month)}`}
              title="What's your monthly budget?"
              description="We'll suggest how to split it next. You can change it any time."
            />
            <BudgetAmountField
              value={draft.amount}
              onChange={(amount) => update({ amount })}
              error={showErrors ? amountError : undefined}
              autoFocus
            />
            <div className="flex justify-between gap-3">
              <Button variant="ghost" size="lg" onClick={() => goTo(0)}>
                Back
              </Button>
              <Button type="submit" size="lg">
                Continue
              </Button>
            </div>
          </form>
        )}

        {draft.step === 2 && (
          <>
            <StepHeading
              eyebrow={`${householdLabel} · ${formatMonth(month)}`}
              title={`Here's a split we recommend for ${formatINR(normalizeAmount(draft.amount))}`}
              description="Half for monthly needs, a third for the rest of life, and something set aside every month. Change any share; the three must add up to 100%."
            />
            <SplitEditor
              totalAmount={normalizeAmount(draft.amount)}
              draft={draft.split}
              check={split}
              onChange={(s) => update({ split: s })}
            />
            {formError && <Alert>{formError}</Alert>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" size="lg" onClick={() => goTo(1)}>
                Back
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="lg" onClick={() => update({ split: recommendedSplit(recommendation) })}>
                  Reset to recommended
                </Button>
                <Button size="lg" disabled={!split.valid} loading={onboarding.isPending} onClick={save}>
                  Save and go to dashboard
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StepHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-caption font-bold tracking-[0.06em] text-accent uppercase">{eyebrow}</span>
      <h1 className="text-[2.125rem] leading-tight font-extrabold tracking-tight">{title}</h1>
      <p className="max-w-[680px] text-base text-muted-foreground">{description}</p>
    </div>
  );
}
