import type { TimeSeriesPoint } from "@/types/application.types";
import { Card, CardHeader } from "./card";

const WIDTH = 600;
const HEIGHT = 240;
const PAD = { top: 24, right: 24, bottom: 32, left: 36 };
const GLOW_SECONDS = 5;

/** Line chart that draws itself in on load, with a glowing dot that travels the trend once. */
/** A round tick step giving about five gridlines: 1, 2, 5, 10, 20, 50… */
function tickStep(max: number) {
  const rough = Math.max(1, max / 5);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].find((m) => m * magnitude >= rough) ?? 10;
  return step * magnitude;
}

interface OverTimeChartProps {
  points: TimeSeriesPoint[];
  subtitle?: string;
}

export function OverTimeChart({ points, subtitle }: OverTimeChartProps) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = tickStep(max);
  const yMax = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = points.length - 1;

  return (
    <Card>
      <CardHeader title="Applications Over Time" subtitle={subtitle} />
      <div className="px-2 pt-2 pb-4 sm:px-4">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Applications over time">
          <defs>
            <linearGradient id="over-time-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="over-time-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--blue-mid)" />
              <stop offset="100%" stopColor="var(--blue-bright)" />
            </linearGradient>
            <filter id="over-time-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" />
              <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
                {tick}
              </text>
            </g>
          ))}

          {points.length > 0 && (
            <>
              <path d={area} fill="url(#over-time-fill)" className="chart-area" />
              <path
                d={line}
                pathLength={1}
                fill="none"
                stroke="url(#over-time-stroke)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chart-line"
              />
            </>
          )}

          {points.length > 1 && (
            <g className="chart-glow" aria-hidden="true">
              <circle r="9" fill="var(--blue-glow)" filter="url(#over-time-glow)" opacity="0">
                <animateMotion dur={`${GLOW_SECONDS}s`} begin="1.6s" repeatCount="1" fill="freeze" path={line} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${GLOW_SECONDS}s`} begin="1.6s" repeatCount="1" fill="freeze" />
              </circle>
              <circle r="4" fill="var(--card)" stroke="var(--blue-bright)" strokeWidth="2" opacity="0">
                <animateMotion dur={`${GLOW_SECONDS}s`} begin="1.6s" repeatCount="1" fill="freeze" path={line} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${GLOW_SECONDS}s`} begin="1.6s" repeatCount="1" fill="freeze" />
              </circle>
            </g>
          )}

          {points.map((p, i) => (
            <g key={p.label} style={{ ["--delay" as string]: `${0.5 + (i / Math.max(1, last)) * 1.1}s` }}>
              {i === last && (
                <circle cx={x(i)} cy={y(p.value)} r="6" fill="var(--primary)" opacity="0" className="chart-pulse" />
              )}
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r="4.5"
                fill="var(--card)"
                stroke="var(--primary)"
                strokeWidth="2"
                className="chart-point cursor-pointer transition-[r] duration-200 hover:[r:7px]"
              >
                <title>{`${p.label}: ${p.value} applications`}</title>
              </circle>
              <text x={x(i)} y={y(p.value) - 12} textAnchor="middle" className="chart-point fill-foreground text-[11px] font-medium">
                {p.value}
              </text>
              <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}
