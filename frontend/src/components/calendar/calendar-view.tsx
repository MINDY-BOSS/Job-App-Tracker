"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Card, CardHeader } from "@/components/dashboard/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { useCalendar } from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  WEEKDAYS,
  addDays,
  dayKey,
  eventDayKey,
  fetchRange,
  formatTime,
  groupByDay,
  keyToDate,
  monthGrid,
} from "./calendar-utils";
import { EVENT_STYLES, EventItem } from "./event-item";

const MAX_CHIPS = 2;
const UPCOMING_DAYS = 14;

const noopSubscribe = () => () => {};

/** Today's key on the client; null during prerender so the server never guesses the date. */
function useTodayKey() {
  return useSyncExternalStore(noopSubscribe, () => dayKey(new Date()), () => null);
}

export function CalendarView() {
  const todayKey = useTodayKey();
  if (!todayKey) return <CalendarSkeleton />;
  return <Calendar todayKey={todayKey} />;
}

function Calendar({ todayKey }: { todayKey: string }) {
  const today = keyToDate(todayKey);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(todayKey);

  const days = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const range = useMemo(() => fetchRange(days[0], days[days.length - 1]), [days]);
  const upcomingRange = useMemo(
    () => fetchRange(keyToDate(todayKey), addDays(keyToDate(todayKey), UPCOMING_DAYS)),
    [todayKey],
  );

  const calendar = useCalendar(range.from, range.to);
  const upcoming = useCalendar(upcomingRange.from, upcomingRange.to);

  const byDay = useMemo(() => groupByDay(calendar.data ?? []), [calendar.data]);
  const upcomingEvents = useMemo(() => {
    const last = dayKey(addDays(keyToDate(todayKey), UPCOMING_DAYS));
    return (upcoming.data ?? []).filter((event) => {
      const key = eventDayKey(event);
      return key >= todayKey && key <= last;
    });
  }, [upcoming.data, todayKey]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedEvents = byDay.get(selected) ?? [];
  const selectedLabel = keyToDate(selected).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const moveMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const goToday = () => {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
    setSelected(todayKey);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
          <h2 className="text-lg font-semibold" aria-live="polite">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight />
            </Button>
          </div>
        </div>

        {calendar.error ? <ErrorMessage error={calendar.error} className="m-4" /> : null}

        <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-2">
              <span className="sm:hidden">{day[0]}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "grid grid-cols-7 transition-opacity",
            calendar.isFetching && !calendar.isLoading && "opacity-70",
          )}
        >
          {days.map((date) => {
            const key = dayKey(date);
            const events = byDay.get(key) ?? [];
            const inMonth = date.getMonth() === cursor.month;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const label = `${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${
              events.length ? `, ${events.length} event${events.length === 1 ? "" : "s"}` : ""
            }`;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                aria-label={label}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex min-h-14 cursor-pointer flex-col items-stretch gap-1 border-r border-b p-1 text-left transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none sm:min-h-24 sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                  !inMonth && "bg-muted/40 text-muted-foreground",
                  isSelected && "bg-primary/5 ring-2 ring-primary ring-inset",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center self-center rounded-full text-xs font-medium sm:self-start sm:text-sm",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {date.getDate()}
                </span>

                {calendar.isLoading ? null : (
                  <>
                    {/* Dots on phones, chips from sm up. */}
                    {events.length > 0 && (
                      <span className="flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden="true">
                        {events.slice(0, 3).map((event) => (
                          <span
                            key={`${event.id}-${event.type}`}
                            className={cn("size-1.5 rounded-full", EVENT_STYLES[event.type].dot)}
                          />
                        ))}
                      </span>
                    )}
                    <span className="hidden flex-col gap-1 sm:flex" aria-hidden="true">
                      {events.slice(0, MAX_CHIPS).map((event) => (
                        <span
                          key={`${event.id}-${event.type}`}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[11px] leading-tight font-medium",
                            EVENT_STYLES[event.type].chip,
                          )}
                        >
                          {event.type === "interview" && `${formatTime(event.date)} `}
                          {event.company}
                        </span>
                      ))}
                      {events.length > MAX_CHIPS && (
                        <span className="px-1.5 text-[11px] font-medium text-muted-foreground">
                          +{events.length - MAX_CHIPS} more
                        </span>
                      )}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          {(["deadline", "interview"] as const).map((type) => (
            <span key={type} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", EVENT_STYLES[type].dot)} aria-hidden="true" />
              {EVENT_STYLES[type].label}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader title={selectedLabel} subtitle={eventCountLabel(selectedEvents.length)} />
          <div className="p-2 sm:p-3">
            {calendar.isLoading ? (
              <ListSkeleton />
            ) : selectedEvents.length ? (
              <ul className="space-y-1">
                {selectedEvents.map((event) => (
                  <EventItem key={`${event.id}-${event.type}`} event={event} />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled"
                description="Add a deadline or interview date to an application to see it here."
                className="py-8"
              />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming" subtitle={`Next ${UPCOMING_DAYS} days`} />
          <div className="p-2 sm:p-3">
            {upcoming.error ? (
              <ErrorMessage error={upcoming.error} />
            ) : upcoming.isLoading ? (
              <ListSkeleton />
            ) : upcomingEvents.length ? (
              <ul className="space-y-1">
                {upcomingEvents.map((event) => (
                  <EventItem
                    key={`${event.id}-${event.type}`}
                    event={event}
                    showDate={keyToDate(eventDayKey(event)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
                No deadlines or interviews in the next two weeks.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function eventCountLabel(count: number) {
  return count ? `${count} event${count === 1 ? "" : "s"}` : "No events";
}

function ListSkeleton() {
  return (
    <div className="space-y-3 p-2.5">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Skeleton className="h-[520px] rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
