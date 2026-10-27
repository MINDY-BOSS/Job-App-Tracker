import Link from "next/link";
import { CalendarClock, UsersRound } from "lucide-react";

import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/application.types";
import { formatTime } from "./calendar-utils";

export const EVENT_STYLES = {
  deadline: {
    label: "Deadline",
    icon: CalendarClock,
    chip: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  interview: {
    label: "Interview",
    icon: UsersRound,
    chip: "bg-status-interview-soft text-status-interview-ink",
    dot: "bg-status-interview",
  },
} as const;

/** One event in a list (selected day / upcoming), linking to its application. */
export function EventItem({ event, showDate }: { event: CalendarEvent; showDate?: string }) {
  const style = EVENT_STYLES[event.type];
  const Icon = style.icon;

  return (
    <li>
      <Link
        href={ROUTES.application(event.id)}
        className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"
      >
        <CompanyAvatar name={event.company} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{event.company}</span>
          <span className="block truncate text-xs text-muted-foreground">{event.role}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", style.chip)}>
              <Icon className="size-3.5" aria-hidden="true" />
              {style.label}
              {event.type === "interview" && ` · ${formatTime(event.date)}`}
            </span>
            <StatusBadge status={event.status} className="py-0.5" />
          </span>
        </span>
        {showDate && <span className="shrink-0 text-xs font-medium text-muted-foreground">{showDate}</span>}
      </Link>
    </li>
  );
}
