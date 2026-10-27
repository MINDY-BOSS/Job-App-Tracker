"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application.types";
import { Card, CardHeader } from "./card";
import { STATUS_META, STATUS_ORDER } from "./status";

const RADIUS = 42;
const STROKE = 26;
const ACTIVE_STROKE = 31;
const CENTER = 60;
/** Distance of the hover bubble from the donut centre, as a % of the chart box. */
const BUBBLE_RADIUS_PCT = ((RADIUS + ACTIVE_STROKE / 2 + 7) / 120) * 100;

/** Counts up to `value`; remount it (via `key`) to replay. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      setShown(value * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{shown.toFixed(Number.isInteger(value) ? 0 : 1)}</>;
}

interface StatusChartProps {
  breakdown: Record<ApplicationStatus, number>;
  subtitle?: string;
}

export function StatusChart({ breakdown, subtitle }: StatusChartProps) {
  const [active, setActive] = useState<ApplicationStatus | null>(null);
  const total = STATUS_ORDER.reduce((sum, status) => sum + breakdown[status], 0);

  // The circle uses pathLength=100, so lengths and offsets below are percentages.
  const percents = STATUS_ORDER.map((status) => (total ? (breakdown[status] / total) * 100 : 0));
  const segments = STATUS_ORDER.map((status, i) => ({
    status,
    count: breakdown[status],
    percent: percents[i],
    offset: percents.slice(0, i).reduce((sum, p) => sum + p, 0),
    delay: `${i * 0.12}s`,
  }));
  const current = segments.find((s) => s.status === active);

  const bubble = current && current.count > 0 ? bubblePosition(current.offset + current.percent / 2) : null;

  return (
    <Card>
      <CardHeader title="Applications by Status" subtitle={subtitle} />
      <div className="flex flex-col items-center gap-8 px-4 pt-6 pb-6 sm:flex-row sm:px-5">
        <div className="relative size-52 shrink-0">
          <div className="ring-sweep size-full">
            {/* Starts at 12 o'clock and runs clockwise. */}
            <svg viewBox="0 0 120 120" className="size-full -rotate-90 overflow-visible" role="group" aria-label="Applications by status">
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth={STROKE} />
              {segments.map(({ status, count, percent, offset, delay }) => {
                const isActive = active === status;
                return (
                  <circle
                    key={status}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    pathLength={100}
                    fill="none"
                    stroke={STATUS_META[status].color}
                    strokeWidth={isActive ? ACTIVE_STROKE : STROKE}
                    strokeDasharray={`${percent} ${100 - percent}`}
                    strokeDashoffset={-offset}
                    tabIndex={0}
                    aria-label={`${STATUS_META[status].label}: ${count} (${formatPercent(percent)}%)`}
                    onMouseEnter={() => setActive(status)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(status)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "ring-segment cursor-pointer outline-none transition-[stroke-width,opacity] duration-200",
                      active && !isActive && "opacity-35",
                    )}
                    style={{ ["--delay" as string]: delay }}
                  />
                );
              })}
            </svg>
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {current ? (
              <div key={current.status} className="animate-pop flex flex-col items-center">
                <span className="text-2xl font-semibold" style={{ color: STATUS_META[current.status].color }}>
                  <CountUp value={Math.round(current.percent * 10) / 10} />%
                </span>
                <span className="text-xs text-muted-foreground">{STATUS_META[current.status].label}</span>
              </div>
            ) : (
              <>
                <span className="text-2xl font-semibold">{total}</span>
                <span className="text-sm text-muted-foreground">Total</span>
              </>
            )}
          </div>

          {current && bubble && (
            <span
              key={current.status}
              aria-hidden="true"
              className="animate-pop pointer-events-none absolute z-10 flex size-8 items-center justify-center rounded-full border bg-card text-sm font-semibold shadow-md"
              style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, translate: "-50% -50%", color: STATUS_META[current.status].color }}
            >
              {current.count}
            </span>
          )}
        </div>

        <ul className="w-full space-y-1">
          {segments.map(({ status, count, percent }) => (
            <li
              key={status}
              tabIndex={0}
              onMouseEnter={() => setActive(status)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(status)}
              onBlur={() => setActive(null)}
              className={cn(
                "flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm transition-[background-color,opacity] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === status && "bg-muted",
                active && active !== status && "opacity-50",
              )}
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: STATUS_META[status].color }} />
              <span className="flex-1">{STATUS_META[status].label}</span>
              <span>
                <span className="font-medium">{count}</span>{" "}
                <span className="text-muted-foreground">({formatPercent(percent)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function formatPercent(percent: number) {
  return String(Math.round(percent * 10) / 10);
}

/** Position (in % of the chart box) just outside the ring at `percentAround`, measured clockwise from 12 o'clock. */
function bubblePosition(percentAround: number) {
  const angle = (percentAround / 100) * 2 * Math.PI;
  return {
    x: 50 + Math.sin(angle) * BUBBLE_RADIUS_PCT,
    y: 50 - Math.cos(angle) * BUBBLE_RADIUS_PCT,
  };
}
