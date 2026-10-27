export const PERIODS = ['week', 'month', 'year'] as const;
export type Period = (typeof PERIODS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of today in server-local time. */
export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Rolling window ending now: last 7 days, 30 days or 365 days. */
export function periodRange(period: Period, now = new Date()) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const end = now;
  const start = addDays(startOfDay(now), -(days - 1));
  const previousStart = addDays(start, -days);
  return { start, end, previousStart };
}
