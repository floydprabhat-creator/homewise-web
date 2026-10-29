import { Logo } from '@/components/layout/logo';
import { ProgressBar } from '@/components/ui/progress-bar';

// Illustrative figures for the marketing panel; not real household data.
const PREVIEW = {
  spent: '₹31,200',
  total: '₹60,000',
  usedPercent: 52,
  buckets: [
    { label: 'Essentials', percent: 62 },
    { label: 'Lifestyle', percent: 48 },
    { label: 'Savings', percent: 33 },
  ],
};

/** Purple left half of the login and register pages. Hidden on small screens. */
export function BrandPanel() {
  return (
    <section className="hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex xl:p-16">
      <Logo inverse />

      <div className="flex max-w-xl flex-col gap-5">
        <h2 className="text-[2.75rem] leading-[1.1] font-extrabold tracking-[-0.03em]">
          Every household rupee, <br />
          in one place.
        </h2>
        <p className="text-lg text-white/85">
          Plan the month, split bills between family members, and get a nudge before anything is due.
        </p>
      </div>

      <div aria-hidden className="flex max-w-[420px] flex-col gap-3.5 rounded-2xl bg-white/12 p-[22px] dark:bg-white/7">
        <div className="flex items-center justify-between text-body">
          <span className="text-white/85">Monthly budget</span>
          <span className="font-bold">{PREVIEW.usedPercent}% used</span>
        </div>
        <p className="flex items-baseline gap-2">
          <span className="text-figure font-extrabold">{PREVIEW.spent}</span>
          <span className="text-body text-white/85">of {PREVIEW.total}</span>
        </p>
        <div className="flex flex-col gap-3">
          {PREVIEW.buckets.map((bucket) => (
            <div key={bucket.label} className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-4 text-body">
              <span>{bucket.label}</span>
              <ProgressBar value={bucket.percent} tone="inverse" label={bucket.label} className="h-1.5" />
              <span className="text-right">{bucket.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
