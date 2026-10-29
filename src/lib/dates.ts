// Mirrors homewise-api/src/utils/dates.ts: all business dates are in IST.
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const todayIST = () => formatter.format(new Date());
export const currentMonthIST = () => todayIST().slice(0, 7);

export function addMonths(month: string, n: number) {
  const [year, mon] = month.split('-').map(Number) as [number, number];
  const index = year * 12 + (mon - 1) + n;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** Shift a YYYY-MM-DD date by n days. */
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Spending can be dated from the 1st of last month (IST) up to today. */
export const earliestEntryDate = () => `${addMonths(currentMonthIST(), -1)}-01`;
