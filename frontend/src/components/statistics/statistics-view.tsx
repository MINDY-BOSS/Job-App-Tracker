"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  ChartNoAxesColumn,
  Clock,
  MessageSquareReply,
  SquareCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Card, CardHeader } from "@/components/dashboard/card";
import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";
import { useStats } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { StatsData, StatusCounts } from "@/types/application.types";
import { MonthlyChart } from "./monthly-chart";

export function StatisticsView() {
  const { data, error, isLoading } = useStats();

  if (error) return <ErrorMessage error={error} />;
  if (isLoading || !data) return <StatisticsSkeleton />;

  if (data.total === 0) {
    return (
      <Card>
        <EmptyState
          icon={ChartNoAxesColumn}
          title="No statistics yet"
          description="Add your first application and your response rates, funnel and trends will show up here."
          action={
            <Link href={ROUTES.newApplication} className={buttonVariants()}>
              Add application
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <KpiTiles data={data} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <MonthlyChart monthly={data.monthly} />
        <Funnel funnel={data.funnel} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TopList title="Top companies" items={data.topCompanies} withAvatar />
        <TopList title="Top roles" items={data.topRoles} />
      </div>
    </div>
  );
}

function KpiTiles({ data }: { data: StatsData }) {
  const tiles: { label: string; value: string; hint: string; icon: LucideIcon; className: string }[] = [
    {
      label: "Total applications",
      value: String(data.total),
      hint: "All time",
      icon: BriefcaseBusiness,
      className: "bg-primary/10 text-primary",
    },
    {
      label: "Response rate",
      value: `${data.rates.response}%`,
      hint: "Heard back (any status but Applied)",
      icon: MessageSquareReply,
      className: "bg-status-applied-soft text-status-applied-ink",
    },
    {
      label: "Interview rate",
      value: `${data.rates.interview}%`,
      hint: "Reached interview or offer",
      icon: UserRound,
      className: "bg-status-interview-soft text-status-interview-ink",
    },
    {
      label: "Offer rate",
      value: `${data.rates.offer}%`,
      hint: "Applications that became offers",
      icon: SquareCheck,
      className: "bg-status-offer-soft text-status-offer-ink",
    },
    {
      label: "Avg. days to response",
      value: data.avgDaysToResponse === null ? "—" : String(data.avgDaysToResponse),
      hint: "Based on each application's last status update",
      icon: Clock,
      className: "bg-status-rejected-soft text-status-rejected-ink",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {tiles.map(({ label, value, hint, icon: Icon, className }) => (
        <div key={label} className="flex gap-4 rounded-xl border bg-card p-4 shadow-xs">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", className)}>
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ funnel }: { funnel: StatsData["funnel"] }) {
  const applied = funnel[0]?.value ?? 0;

  return (
    <Card>
      <CardHeader title="Application funnel" subtitle="How far your applications get" />
      <ol className="space-y-5 px-4 pt-5 pb-6 sm:px-5">
        {funnel.map((stage) => {
          const pct = applied ? Math.round((stage.value / applied) * 1000) / 10 : 0;
          return (
            <li key={stage.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{stage.label}</span>
                <span className="tabular-nums">
                  <span className="font-semibold">{stage.value}</span>{" "}
                  <span className="text-muted-foreground">({pct}%)</span>
                </span>
              </div>
              <div
                className="h-5 rounded-r bg-muted"
                role="meter"
                aria-label={`${stage.label}: ${stage.value} of ${applied}`}
                aria-valuemin={0}
                aria-valuemax={applied}
                aria-valuenow={stage.value}
              >
                <div
                  className="h-full rounded-r bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${pct}%`, minWidth: stage.value ? 4 : 0 }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

interface TopListProps {
  title: string;
  items: ({ name: string; total: number } & StatusCounts)[];
  withAvatar?: boolean;
}

function TopList({ title, items, withAvatar }: TopListProps) {
  const max = Math.max(1, ...items.map((item) => item.total));

  return (
    <Card>
      <CardHeader title={title} subtitle="By number of applications" />
      <ul className="divide-y px-4 pt-3 pb-2 sm:px-5">
        {items.map((item) => {
          const summary = STATUS_ORDER.filter((s) => item[s] > 0)
            .map((s) => `${STATUS_META[s].label} ${item[s]}`)
            .join(", ");
          return (
            <li key={item.name} className="flex items-center gap-3 py-3">
              {withAvatar && <CompanyAvatar name={item.name} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{item.total}</span>
                </div>
                {/* Bar length is relative to the top entry; segments split it by status. */}
                <div className="mt-1.5 h-2 rounded-full bg-muted" title={summary}>
                  <div className="flex h-full gap-0.5" style={{ width: `${(item.total / max) * 100}%` }}>
                    {STATUS_ORDER.filter((s) => item[s] > 0).map((s) => (
                      <span
                        key={s}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                        style={{ flexGrow: item[s], backgroundColor: STATUS_META[s].color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="sr-only">{summary}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-3 text-xs text-muted-foreground sm:px-5">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: STATUS_META[status].color }} aria-hidden="true" />
            {STATUS_META[status].label}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
