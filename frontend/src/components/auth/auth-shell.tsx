import { AuthBackdrop } from "./auth-backdrop";
import { Briefcase, CalendarClock, ChartNoAxesColumn, Send } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Send, title: "Log every application", text: "Company, role, status and notes in one place." },
  { icon: CalendarClock, title: "Never miss a deadline", text: "See what is due next before it slips by." },
  { icon: ChartNoAxesColumn, title: "Know where you stand", text: "Track your pipeline from applied to offer." },
];

const STATUSES = [
  { label: "Applied", color: "bg-status-applied" },
  { label: "Interview", color: "bg-status-interview" },
  { label: "Rejected", color: "bg-status-rejected" },
  { label: "Offer", color: "bg-status-offer" },
];

function Brand({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <div className={className}>
      <span className="relative flex size-11 items-center justify-center rounded-xl bg-white text-blue-deep">
        {animated && (
          <>
            <span aria-hidden="true" className="animate-pulse-ring absolute inset-0 rounded-xl border border-white/60" />
            <span aria-hidden="true" className="animate-pulse-ring absolute inset-0 rounded-xl border border-white/40 [--delay:-1.6s]" />
          </>
        )}
        <Briefcase className="relative size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-semibold leading-tight">JobTracker</p>
        <p className="text-sm opacity-75">Track. Apply. Achieve.</p>
      </div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[5fr_6fr]">
      <aside className="bg-gradient-blue relative isolate hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
        <AuthBackdrop />
        <Brand animated className="animate-rise-in flex items-center gap-3" />

        <div className="animate-rise-in max-w-md [--delay:150ms]">
          <h2 className="text-balance text-4xl font-semibold leading-tight tracking-tight">
            Every application, one clear pipeline.
          </h2>
          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-white/75">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ul className="animate-rise-in flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80 [--delay:300ms]" aria-label="Application statuses">
          {STATUSES.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="relative isolate flex flex-col overflow-hidden bg-gradient-to-br from-[#f4f8ff] via-[#e8f0ff] to-[#d9e6ff]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob-a absolute -right-1/4 -top-1/4 size-[60%] rounded-full bg-blue-bright/20 blur-3xl" />
          <div className="animate-blob-b absolute -bottom-1/4 -left-1/4 size-[65%] rounded-full bg-blue-glow/25 blur-3xl" />
        </div>
        <Brand className="bg-gradient-blue flex items-center gap-3 px-6 py-5 text-white lg:hidden" />
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="animate-rise-in w-full max-w-md rounded-2xl border border-white/80 bg-card/95 p-6 shadow-xl shadow-blue-deep/10 backdrop-blur sm:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
