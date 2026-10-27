import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleX,
  Minus,
  Send,
  SquareCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { DashboardStat } from "@/types/application.types";
import { cn } from "@/lib/utils";

const STAT_STYLES: Record<DashboardStat["key"], { icon: LucideIcon; className: string }> = {
  total: { icon: BriefcaseBusiness, className: "bg-primary/10 text-primary" },
  applied: { icon: Send, className: "bg-status-applied-soft text-status-applied-ink" },
  interview: { icon: UserRound, className: "bg-status-interview-soft text-status-interview-ink" },
  rejected: { icon: CircleX, className: "bg-status-rejected-soft text-status-rejected-ink" },
  offer: { icon: SquareCheck, className: "bg-status-offer-soft text-status-offer-ink" },
};

interface StatCardsProps {
  stats: DashboardStat[];
  /** e.g. "previous 30 days". */
  comparison: string;
}

export function StatCards({ stats, comparison }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {stats.map((stat) => {
        const { icon: Icon, className } = STAT_STYLES[stat.key];
        const up = stat.change > 0;
        const flat = stat.change === 0;
        return (
          <div key={stat.key} className="flex gap-4 rounded-xl border bg-card p-4 shadow-xs">
            <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-xl", className)}>
              <Icon className="size-7" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs",
                  flat ? "text-muted-foreground" : up ? "text-success" : "text-destructive",
                )}
              >
                {flat ? (
                  <Minus className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowUpRight className={cn("size-3.5", !up && "rotate-90")} aria-hidden="true" />
                )}
                <span>
                  <span className="sr-only">{flat ? "No change" : up ? "Up" : "Down"} </span>
                  {Math.abs(stat.change)}% vs {comparison}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
