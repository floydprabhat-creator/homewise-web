'use client';

import { RotateCcw, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AffixInput } from '@/components/ui/affix-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { apiErrorMessage } from '@/lib/form-errors';
import { formatINR } from '@/lib/format';
import type { BudgetAdvice, BudgetAdviceRequest } from '@/types/api';
import { BUCKETS, BUCKET_INFO } from '@/types/constants';
import { useBudgetAdvice } from '../api';
import { checkAmount, normalizeAmount } from '../schemas';
import { SplitBar } from './split-bar';

type Answers = BudgetAdviceRequest['answers'];
type Question =
  | { key: 'monthlyIncome' | 'housingCost' | 'otherEmis'; ask: string; kind: 'amount'; none?: string }
  | { key: Exclude<keyof Answers, 'monthlyIncome' | 'housingCost' | 'otherEmis'>; ask: string; kind: 'choice'; options: [string, string][] };

// Asked in the app, one at a time, so answering is instant; the AI is called once all are answered.
const QUESTIONS: Question[] = [
  { key: 'monthlyIncome', ask: "What's your household's monthly take-home income?", kind: 'amount' },
  {
    key: 'householdSize',
    ask: 'How many people does it support?',
    kind: 'choice',
    options: [['1', 'Just me'], ['2', '2'], ['3-4', '3–4'], ['5+', '5 or more']],
  },
  { key: 'housingCost', ask: 'How much goes to rent or a home loan EMI each month?', kind: 'amount', none: 'No rent or EMI' },
  { key: 'otherEmis', ask: 'Any other loan EMIs each month (car, personal, education)?', kind: 'amount', none: 'No other EMIs' },
  {
    key: 'emergencySavings',
    ask: 'How much do you have saved for emergencies?',
    kind: 'choice',
    options: [['NONE', 'Nothing yet'], ['UNDER_3_MONTHS', 'Under 3 months of expenses'], ['3_TO_6_MONTHS', '3–6 months'], ['OVER_6_MONTHS', 'Over 6 months']],
  },
  {
    key: 'goal',
    ask: "What's your main money goal right now?",
    kind: 'choice',
    options: [
      ['EMERGENCY_FUND', 'Emergency fund'],
      ['HOME', 'Buy a home'],
      ['RETIREMENT', 'Retirement'],
      ['CHILD_EDUCATION', "Child's education"],
      ['TRAVEL', 'Travel'],
      ['DEBT_FREE', 'Pay off loans'],
    ],
  },
  {
    key: 'risk',
    ask: 'How do you feel about investments that go up and down?',
    kind: 'choice',
    options: [['LOW', 'Play it safe'], ['MEDIUM', 'Some ups and downs are fine'], ['HIGH', 'Comfortable, for long-term growth']],
  },
];

type Message = { from: 'ai' | 'me'; text: string };

function Bubble({ from, children }: { from: Message['from']; children: ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
        from === 'ai' ? 'self-start rounded-bl-md bg-neutral text-foreground' : 'self-end rounded-br-md bg-primary text-primary-foreground',
      )}
    >
      {children}
    </div>
  );
}

function SuggestionCard({ advice }: { advice: BudgetAdvice }) {
  return (
    <div className="flex flex-col gap-3 self-stretch rounded-2xl border border-border p-4 text-foreground">
      <SplitBar percents={advice.allocations} />
      <ul className="flex flex-col gap-1.5 text-sm">
        {BUCKETS.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span aria-hidden className={cn('size-2.5 rounded-full', BUCKET_INFO[b].dot)} />
            <span className="flex-1">{BUCKET_INFO[b].label}</span>
            <b className="font-bold">{advice.allocations[b]}%</b>
          </li>
        ))}
        {advice.targets.map((t) => (
          <li key={t.categoryId} className="flex items-center gap-2 pl-[18px] text-muted-foreground">
            <span className="flex-1">{t.name}</span>
            <span>{t.percent}%</span>
          </li>
        ))}
      </ul>
      <p className="text-sm">{advice.summary}</p>
      {advice.investing.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Where the savings could go</span>
          <ul className="flex flex-col gap-1.5 text-sm">
            {advice.investing.map((i) => (
              <li key={i.type}>
                <b className="font-semibold">{i.type}</b> <span className="text-muted-foreground">· {i.note}</span>
              </li>
            ))}
          </ul>
          <span className="text-[11px] text-muted-foreground">
            General guidance, not financial advice. Check with a SEBI-registered adviser before investing.
          </span>
        </div>
      )}
    </div>
  );
}

type BudgetAssistantProps = {
  open: boolean;
  onClose: () => void;
  /** Fills the split editor; the head still saves it. `income` fills the amount if it's empty. */
  onApply: (advice: BudgetAdvice, income: string) => void;
};

/** A few questions in a chat, then an AI-suggested split the head can apply, adjust by asking, or ignore. */
export function BudgetAssistant({ open, onClose, onApply }: BudgetAssistantProps) {
  const advise = useBudgetAdvice();
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [messages, setMessages] = useState<Message[]>([{ from: 'ai', text: QUESTIONS[0]!.ask }]);
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [requests, setRequests] = useState<string[]>([]);
  const [draftRequest, setDraftRequest] = useState('');
  const [advice, setAdvice] = useState<BudgetAdvice | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // A block body: newer browsers return a Promise from scrollIntoView, and an effect may only return a clean-up function.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, advice, advise.isPending]);

  const question = QUESTIONS[step];

  function reset() {
    setAnswers({});
    setMessages([{ from: 'ai', text: QUESTIONS[0]!.ask }]);
    setStep(0);
    setAmount('');
    setRequests([]);
    setAdvice(null);
    advise.reset();
  }

  function ask(all: Answers, nextRequests: string[], current: BudgetAdvice | null) {
    advise.mutate(
      {
        answers: all,
        requests: nextRequests,
        current: current
          ? { allocations: current.allocations, targets: current.targets.map(({ categoryId, percent }) => ({ categoryId, percent })) }
          : undefined,
      },
      {
        onSuccess: (result) => {
          setAdvice(result);
          setMessages((m) => [...m, { from: 'ai', text: result.reply ?? 'Here is a split that fits what you told me:' }]);
        },
      },
    );
  }

  function answer(value: string, label: string) {
    if (!question) return;
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    setAmount('');
    setAmountError(undefined);
    const following = QUESTIONS[step + 1];
    setMessages((m) => [...m, { from: 'me', text: label }, ...(following ? [{ from: 'ai' as const, text: following.ask }] : [])]);
    setStep(step + 1);
    if (!following) ask(next as Answers, [], null);
  }

  function submitAmount(e: FormEvent) {
    e.preventDefault();
    const error = checkAmount(amount);
    if (error) return setAmountError(error === 'Enter your monthly budget' ? 'Enter an amount' : error);
    answer(normalizeAmount(amount), formatINR(normalizeAmount(amount)));
  }

  function submitRequest(e: FormEvent) {
    e.preventDefault();
    const text = draftRequest.trim();
    if (!text || advise.isPending) return;
    const next = [...requests, text].slice(-5);
    setRequests(next);
    setDraftRequest('');
    setMessages((m) => [...m, { from: 'me', text }]);
    ask(answers as Answers, next, advice);
  }

  const done = step >= QUESTIONS.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Plan your budget with AI"
      footer={
        done && advice ? (
          <>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw aria-hidden className="size-4" />
              Start over
            </Button>
            <Button
              onClick={() => {
                onApply(advice, answers.monthlyIncome ?? '');
                onClose();
              }}
            >
              Apply to my budget
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 text-foreground">
        <div className="flex max-h-[55vh] flex-col gap-2.5 overflow-y-auto pr-1" aria-live="polite">
          {messages.map((m, i) => (
            <Bubble key={i} from={m.from}>
              {m.text}
            </Bubble>
          ))}
          {advice && !advise.isPending && <SuggestionCard advice={advice} />}
          {advise.isPending && (
            <Bubble from="ai">
              <span className="inline-flex items-center gap-2">
                <Spinner /> Working out your split… this can take up to a minute.
              </span>
            </Bubble>
          )}
          <div ref={endRef} />
        </div>

        {advise.isError && (
          <Alert>
            {apiErrorMessage(advise.error)}{' '}
            <button
              type="button"
              className="font-bold underline"
              onClick={() => ask(answers as Answers, requests, advice)}
            >
              Try again
            </button>
          </Alert>
        )}

        {question?.kind === 'choice' && (
          <div className="flex flex-wrap gap-2">
            {question.options.map(([value, label]) => (
              <Chip key={value} pressed={false} onClick={() => answer(value, label)}>
                {label}
              </Chip>
            ))}
          </div>
        )}

        {question?.kind === 'amount' && (
          <form onSubmit={submitAmount} noValidate className="flex flex-col gap-2">
            <div className="flex gap-2">
              <AffixInput
                prefix="₹"
                inputMode="decimal"
                placeholder="0"
                aria-label={question.ask}
                aria-invalid={amountError ? true : undefined}
                wrapperClassName="flex-1"
                value={amount}
                autoFocus
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(undefined);
                }}
              />
              <Button type="submit" aria-label="Send">
                <Send aria-hidden className="size-4" />
              </Button>
            </div>
            {amountError && <span className="text-xs text-danger">{amountError}</span>}
            {question.none && (
              <Chip pressed={false} className="self-start" onClick={() => answer('0', question.none!)}>
                {question.none}
              </Chip>
            )}
          </form>
        )}

        {done && advice && (
          <form onSubmit={submitRequest} className="flex gap-2">
            <Input
              aria-label="Ask for a change"
              placeholder="Ask for a change, e.g. more for travel"
              maxLength={300}
              value={draftRequest}
              disabled={advise.isPending}
              onChange={(e) => setDraftRequest(e.target.value)}
            />
            <Button type="submit" aria-label="Send" disabled={!draftRequest.trim() || advise.isPending}>
              <Send aria-hidden className="size-4" />
            </Button>
          </form>
        )}

        <span className="text-[11px] text-muted-foreground">
          Your answers are sent to Google Gemini to suggest a split. Nothing changes until you save your budget.
        </span>
      </div>
    </Modal>
  );
}
