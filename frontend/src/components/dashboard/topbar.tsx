"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, Plus, Search } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useDashboard } from "@/lib/queries";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const router = useRouter();
  // Shares the dashboard's cached "month" query; alerts don't depend on the period.
  const alerts = useDashboard("month").data?.alerts ?? 0;

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(q ? `${ROUTES.applications}?${new URLSearchParams({ q })}` : ROUTES.applications);
  }

  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center gap-4 border-b bg-card px-4 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-1 rounded-md p-1.5 text-foreground hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="truncate text-xl font-semibold sm:text-2xl">{title}</h1>

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <form role="search" onSubmit={handleSearch} className="relative hidden md:block">
          <label htmlFor="topbar-search" className="sr-only">
            Search applications
          </label>
          <input
            id="topbar-search"
            name="q"
            type="search"
            placeholder="Search applications, companies..."
            className="h-10 w-64 rounded-lg border bg-card pr-10 pl-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary xl:w-[410px]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <Search className="size-4" />
          </button>
        </form>

        <Link
          href={ROUTES.calendar}
          className="relative rounded-full p-2 hover:bg-muted"
          aria-label={
            alerts
              ? `${alerts} deadline${alerts === 1 ? "" : "s"} or interview${alerts === 1 ? "" : "s"} in the next 7 days`
              : "No deadlines or interviews in the next 7 days"
          }
          title="Deadlines and interviews in the next 7 days"
        >
          <Bell className="size-5" />
          {alerts > 0 && (
            <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {alerts > 9 ? "9+" : alerts}
            </span>
          )}
        </Link>

        <Link
          href={ROUTES.newApplication}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Application</span>
        </Link>
      </div>
    </header>
  );
}
