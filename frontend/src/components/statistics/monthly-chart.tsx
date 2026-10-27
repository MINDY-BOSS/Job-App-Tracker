"use client";

import { useState } from "react";

import { Card, CardHeader } from "@/components/dashboard/card";
import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status";
import { cn } from "@/lib/utils";
import type { StatsData } from "@/types/application.types";

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 16, right: 8, bottom: 28, left: 32 };
const MAX_BAR = 24;
const GAP = 2;
const RADIUS = 4;

/** Clean tick step so the axis has at most ~5 ticks. */
function niceStep(max: number) {
  for (const step of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]) {
    if (max / step <= 5) return step;
  }
  return Math.ceil(max / 5);
}

/** Rect with only the top corners rounded (data end), square at the baseline side. */
function topRoundedRect(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

export function MonthlyChart({ monthly }: { monthly: StatsData["monthly"] }) {
  const [active, setActive] = useState<number | null>(null);

  const totals = monthly.map((m) => STATUS_ORDER.reduce((sum, s) => sum + m[s], 0));
  const step = niceStep(Math.max(1, ...totals));
  const yMax = Math.max(step, Math.ceil(Math.max(1, ...totals) / step) * step);
  const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / monthly.length;
  const barW = Math.min(MAX_BAR, band * 0.6);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;
  const baseline = y(0);

  const activeMonth = active === null ? null : monthly[active];

  return (
    <Card>
      <CardHeader title="Applications per month" subtitle="Last 12 months, by current status" />

      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-3 text-xs text-muted-foreground sm:px-5">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: STATUS_META[status].color }} aria-hidden="true" />
            {STATUS_META[status].label}
          </li>
        ))}
      </ul>

      <div className="relative px-2 pt-2 pb-2 sm:px-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Applications per month by status"
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" />
              <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
                {tick}
              </text>
            </g>
          ))}

          {monthly.map((month, i) => {
            const cx = PAD.left + band * i + band / 2;
            const x = cx - barW / 2;
            const nonZero = STATUS_ORDER.filter((s) => month[s] > 0);

            return (
              <g key={`${month.label}-${i}`}>
                {active === i && (
                  <rect x={PAD.left + band * i} y={PAD.top} width={band} height={plotH} fill="var(--muted)" />
                )}
                {nonZero.map((status, j) => {
                  const below = nonZero.slice(0, j).reduce((sum, s) => sum + month[s], 0);
                  const top = y(below + month[status]);
                  const bottom = y(below);
                  const isTop = j === nonZero.length - 1;
                  // A 2px surface gap separates stacked segments.
                  const h = Math.max(0, bottom - top - (isTop ? 0 : GAP));
                  const segTop = isTop ? top : top + GAP;
                  return isTop ? (
                    <path key={status} d={topRoundedRect(x, segTop, barW, h, RADIUS)} fill={STATUS_META[status].color} />
                  ) : (
                    <rect key={status} x={x} y={segTop} width={barW} height={h} fill={STATUS_META[status].color} />
                  );
                })}
                <text x={cx} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  {month.label}
                </text>
                {/* Full-height hit target, wider than the bar. */}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={plotH + PAD.bottom}
                  fill="transparent"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  className="cursor-pointer outline-none"
                >
                  <title>
                    {`${month.label}: ${totals[i]} total — ${STATUS_ORDER.map((s) => `${STATUS_META[s].label} ${month[s]}`).join(", ")}`}
                  </title>
                </rect>
              </g>
            );
          })}

          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={baseline} y2={baseline} stroke="var(--input)" />
        </svg>

        {activeMonth && active !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-40 -translate-x-1/2 rounded-lg border bg-popover p-2.5 text-xs shadow-md"
            style={{
              left: `clamp(5rem, ${((PAD.left + band * active + band / 2) / WIDTH) * 100}%, calc(100% - 5rem))`,
            }}
          >
            <p className="mb-1.5 font-semibold">
              {activeMonth.label} · {totals[active]} total
            </p>
            <ul className="space-y-1">
              {STATUS_ORDER.map((status) => (
                <li key={status} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_META[status].color }} aria-hidden="true" />
                  <span className="flex-1 text-muted-foreground">{STATUS_META[status].label}</span>
                  <span className="font-medium tabular-nums">{activeMonth[status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <details className="border-t px-4 py-3 sm:px-5">
        <summary className="cursor-pointer text-sm font-medium text-primary">View as table</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Month</th>
                {STATUS_ORDER.map((s) => (
                  <th key={s} className="px-3 py-2 text-right font-medium">
                    {STATUS_META[s].label}
                  </th>
                ))}
                <th className="py-2 pl-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthly.map((month, i) => (
                <tr key={`${month.label}-${i}`} className={cn(totals[i] === 0 && "text-muted-foreground")}>
                  <td className="py-2 pr-3">{month.label}</td>
                  {STATUS_ORDER.map((s) => (
                    <td key={s} className="px-3 py-2 text-right tabular-nums">
                      {month[s]}
                    </td>
                  ))}
                  <td className="py-2 pl-3 text-right font-medium tabular-nums">{totals[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
