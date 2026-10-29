import { createElement } from 'react';
import {
  Droplet,
  Flame,
  GraduationCap,
  House,
  ReceiptText,
  Smartphone,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Matched against the bill name first, then its category; anything else gets a receipt.
const ICONS: [RegExp, LucideIcon][] = [
  [/electric|power/i, Zap],
  [/internet|wi-?fi|broadband/i, Wifi],
  [/mobile|recharge|phone/i, Smartphone],
  [/rent|maintenance|house/i, House],
  [/school|tuition|fees/i, GraduationCap],
  [/water/i, Droplet],
  [/gas|cylinder|lpg/i, Flame],
  [/subscription|netflix|ott|dth|tv/i, Tv],
];

function iconFor(categoryName: string, billName: string): LucideIcon {
  const match = (name: string) => ICONS.find(([pattern]) => pattern.test(name))?.[1];
  return match(billName) ?? match(categoryName) ?? ReceiptText;
}

/** Icon tile for a bill row. */
export function BillIcon({ categoryName, billName }: { categoryName: string; billName: string }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-primary-subtle text-accent">
      {createElement(iconFor(categoryName, billName), { 'aria-hidden': true, className: 'size-5' })}
    </span>
  );
}
