import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string | null,
) {
  if (min == null && max == null) return "—";

  const format = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  if (min != null && max != null) return `${format(min)} – ${format(max)}`;
  return format((min ?? max) as number);
}

/**
 * Formats a date-only value (applied/due dates are stored as UTC midnight)
 * without the viewer's timezone shifting it to the previous day.
 */
export function formatDay(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/** ISO date → "YYYY-MM-DD" for <input type="date"> (UTC, matching formatDay). */
export function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

/** ISO date-time → "YYYY-MM-DDTHH:mm" in local time for <input type="datetime-local">. */
export function toDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Today as "YYYY-MM-DD" in the viewer's timezone. */
export function todayInput() {
  return toDateTimeInput(new Date().toISOString()).slice(0, 10);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "3 days ago", "in 2 days", "today" — for relative timestamps. */
export function formatRelativeDays(value: string | Date) {
  const day = 24 * 60 * 60 * 1000;
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date(value)) - startOf(new Date())) / day);
  if (days === 0) return "today";
  return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(days, "day");
}
