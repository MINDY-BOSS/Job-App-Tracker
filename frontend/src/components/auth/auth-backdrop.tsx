import { Building2 } from "lucide-react";

const FLOATING_CARDS = [
  { company: "Interview scheduled", status: "Interview", dot: "bg-status-interview", className: "right-[6%] top-[14%]", tilt: "4deg", delay: "0s" },
  { company: "Offer received", status: "Offer", dot: "bg-status-offer", className: "right-[12%] bottom-[22%]", tilt: "-5deg", delay: "-3.5s" },
];

/** Purely decorative moving visuals: drifting glow blobs, a panning grid and floating cards. */
export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="animate-blob-a absolute -left-1/4 -top-1/4 size-[70%] rounded-full bg-blue-bright/45 blur-3xl" />
      <div className="animate-blob-b absolute -bottom-1/4 -right-1/4 size-[75%] rounded-full bg-blue-glow/30 blur-3xl" />
      <div className="animate-blob-a absolute left-1/3 top-1/2 size-[40%] rounded-full bg-blue-mid/50 blur-3xl [--delay:-8s]" />

      <div
        className="animate-grid-pan absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 10%, transparent 70%)",
        }}
      />

      {FLOATING_CARDS.map(({ company, status, dot, className, tilt, delay }) => (
        <div
          key={status}
          className={`animate-float-card absolute flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-md ${className}`}
          style={{ ["--tilt" as string]: tilt, ["--delay" as string]: delay }}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-white">
            <Building2 className="size-4" />
          </span>
          <div className="text-white">
            <p className="text-sm font-medium leading-tight">{company}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
              <span className={`size-2 rounded-full ${dot}`} />
              {status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
