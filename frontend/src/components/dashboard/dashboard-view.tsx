"use client";

import { useState } from "react";

import { ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { useDashboard } from "@/lib/queries";
import type { Period } from "@/types/application.types";
import { PERIOD_OPTIONS, PeriodSelect } from "./card";
import { OverTimeChart } from "./over-time-chart";
import { RecentApplications } from "./recent-applications";
import { StatCards } from "./stat-cards";
import { StatusChart } from "./status-chart";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { WelcomeHeading } from "./welcome-heading";

const COMPARISON: Record<Period, string> = {
  week: "previous 7 days",
  month: "previous 30 days",
  year: "previous year",
};

const CHART_RANGE: Record<Period, string> = {
  week: "Last 7 days, by day",
  month: "Last 5 weeks, by week",
  year: "Last 12 months, by month",
};

export function DashboardView() {
  const [period, setPeriod] = useState<Period>("month");
  const { data, error, isPending } = useDashboard(period);
  const range = PERIOD_OPTIONS.find((option) => option.value === period)?.range;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <WelcomeHeading />
          <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your job applications.</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {error && !data ? (
        <ErrorMessage error={error} />
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatCards stats={data.stats} comparison={COMPARISON[period]} />

          <div className="grid gap-6 xl:grid-cols-2">
            <StatusChart breakdown={data.statusBreakdown} subtitle={range} />
            <OverTimeChart
              // Remount on period change so the draw-in animation replays for the new series.
              key={period}
              points={data.overTime}
              subtitle={CHART_RANGE[period]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <RecentApplications applications={data.recent} />
            <UpcomingDeadlines deadlines={data.deadlines} />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[106px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
