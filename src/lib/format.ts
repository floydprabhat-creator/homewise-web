const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** ₹2,315 or ₹1,250.50 (Indian digit grouping; whole rupees drop the decimals). */
export function formatINR(value: string | number) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '₹0';
  const hasPaise = Math.round(n * 100) % 100 !== 0;
  return `₹${hasPaise ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : inr.format(Math.round(n))}`;
}

const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthYear = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// Business dates are plain YYYY-MM-DD strings; format them in UTC so the day never shifts.
const asUTC = (date: string) => new Date(`${date}T00:00:00Z`);

/** "27 Oct" */
export const formatDate = (date: string) => shortDate.format(asUTC(date));
/** "27 Oct 2026" */
export const formatLongDate = (date: string) => longDate.format(asUTC(date));
/** "October 2026" */
export const formatMonth = (month: string) => monthYear.format(asUTC(`${month}-01`));

/** Rupee share of a total for a percentage, e.g. 35% of ₹60,000 = 21000. */
export function shareOf(total: string | number, percent: number) {
  return Math.round(Number(total) * percent) / 100;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const relative = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });

/** "just now", "5 min ago", "3 hours ago", "yesterday", then "27 Oct". */
export function formatRelative(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (seconds > -60) return 'just now';
  if (seconds > -3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (seconds > -86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (seconds > -2 * 86_400) return relative.format(-1, 'day');
  return formatDate(new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
}
