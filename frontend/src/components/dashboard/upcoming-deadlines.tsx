import Link from "next/link";
import { CalendarCheck, CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";
import { cn, formatDay } from "@/lib/utils";
import type { Deadline } from "@/types/application.types";
import { Card, CardHeader } from "./card";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deadlines are date-only (UTC midnight), so compare against today's local calendar date. */
function daysUntil(dueAt: string) {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.round(
    (Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate()) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      DAY_MS,
  );
}

function daysLeftLabel(days: number) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export function UpcomingDeadlines({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Upcoming Deadlines" viewAllHref={ROUTES.calendar} className="pb-4" />
      {deadlines.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No upcoming deadlines"
          description="Add a deadline to an application and it will show up here."
          className="flex-1 border-t"
        />
      ) : (
        <ul className="flex-1 divide-y border-y">
          {deadlines.map((deadline) => {
            const days = daysUntil(deadline.dueAt);
            return (
              <li key={deadline.id}>
                <Link
                  href={ROUTES.application(deadline.id)}
                  className="flex items-center gap-4 px-4 py-2.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5"
                >
                  <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg border">
                    <span className="text-[10px] font-medium uppercase">
                      {formatDay(deadline.dueAt, { month: "short", day: undefined, year: undefined })}
                    </span>
                    <span className="text-base leading-tight font-semibold">
                      {formatDay(deadline.dueAt, { month: undefined, day: "2-digit", year: undefined })}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{deadline.company}</span>
                    <span className="block truncate text-xs text-muted-foreground">{deadline.role}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      days <= 3 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {daysLeftLabel(days)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href={ROUTES.calendar}
        className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium text-primary hover:underline"
      >
        <CalendarDays className="size-4" />
        View Calendar
      </Link>
    </Card>
  );
}
