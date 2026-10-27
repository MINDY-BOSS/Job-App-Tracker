import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Period } from "@/types/application.types";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-xs", className)}>{children}</section>
  );
}

interface CardHeaderProps {
  title: string;
  /** Muted text under the title, e.g. the time range a chart covers. */
  subtitle?: string;
  /** Shows a "View all" link on the right. */
  viewAllHref?: string;
  className?: string;
}

export function CardHeader({ title, subtitle, viewAllHref, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-4 pt-4 sm:px-5", className)}>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      )}
    </div>
  );
}

export const PERIOD_OPTIONS: { value: Period; label: string; range: string }[] = [
  { value: "week", label: "This Week", range: "Last 7 days" },
  { value: "month", label: "This Month", range: "Last 30 days" },
  { value: "year", label: "This Year", range: "Last 12 months" },
];

interface PeriodSelectProps {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
}

export function PeriodSelect({ value, onChange, className }: PeriodSelectProps) {
  return (
    <label className={cn("relative", className)}>
      <span className="sr-only">Period</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Period)}
        className="h-10 cursor-pointer appearance-none rounded-lg border bg-card pr-9 pl-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}
