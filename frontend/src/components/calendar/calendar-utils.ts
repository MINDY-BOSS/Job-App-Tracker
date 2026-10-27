import type { CalendarEvent } from "@/types/application.types";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" for a local calendar day. */
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * The calendar day an event belongs to. Deadlines are date-only (stored at UTC
 * midnight), so they use the UTC date; interviews are real times, so local.
 */
export function eventDayKey(event: CalendarEvent) {
  return event.type === "deadline" ? event.date.slice(0, 10) : dayKey(new Date(event.date));
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Local-midnight days covering the month in whole Mon–Sun weeks. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const start = addDays(first, -offset);
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
}

/**
 * ISO range to fetch for a span of local days, padded a day each side so
 * UTC-midnight deadlines aren't lost to the timezone offset (we filter by key after).
 */
export function fetchRange(firstDay: Date, lastDay: Date) {
  return {
    from: addDays(firstDay, -1).toISOString(),
    to: addDays(lastDay, 2).toISOString(),
  };
}

export function groupByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = eventDayKey(event);
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }
  return map;
}

/** Parses a "YYYY-MM-DD" key as a local date. */
export function keyToDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
