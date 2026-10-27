"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  ClipboardList,
  FileText,
  House,
  LogOut,
  NotebookText,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getInitials, useCurrentUser } from "./user-provider";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: House },
  { label: "Applications", href: ROUTES.applications, icon: ClipboardList },
  { label: "Add Application", href: ROUTES.newApplication, icon: CirclePlus },
  { label: "Calendar", href: ROUTES.calendar, icon: CalendarDays },
  { label: "Statistics", href: ROUTES.statistics, icon: ChartNoAxesColumn },
  { label: "Documents", href: ROUTES.documents, icon: FileText },
  { label: "Companies", href: ROUTES.companies, icon: Users },
  { label: "Notes", href: ROUTES.notes, icon: NotebookText },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
];

function isActive(pathname: string, href: string) {
  // "/applications" shouldn't stay highlighted while on "/applications/new".
  if (href === ROUTES.applications) {
    return pathname === href || (pathname.startsWith(`${href}/`) && pathname !== ROUTES.newApplication);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  /** Desktop only: shrink to an icon rail. The mobile drawer is always full width. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    clearToken();
    router.push(ROUTES.login);
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        data-collapsed={collapsed}
        className={cn(
          "group/sb fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar bg-(image:--gradient-sidebar) text-sidebar-foreground transition-[transform,width] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 data-[collapsed=true]:lg:w-[76px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-[88px] -right-3.5 z-10 hidden size-7 cursor-pointer items-center justify-center rounded-full border bg-card text-foreground shadow-md transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none lg:flex"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>

        <div className="flex items-center justify-between overflow-hidden px-5 pt-6 pb-8 group-data-[collapsed=true]/sb:lg:justify-center group-data-[collapsed=true]/sb:lg:px-0">
          <Link href={ROUTES.dashboard} className="flex items-center gap-3" title="JobTracker">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar-foreground text-sidebar">
              <BriefcaseBusiness className="size-6" />
            </span>
            <span className="group-data-[collapsed=true]/sb:lg:sr-only">
              <span className="block text-xl font-semibold leading-tight">JobTracker</span>
              <span className="block text-xs text-sidebar-foreground/80">Track. Apply. Achieve.</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 group-data-[collapsed=true]/sb:lg:justify-center group-data-[collapsed=true]/sb:lg:px-0 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground",
                isActive(pathname, href) && "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="group-data-[collapsed=true]/sb:lg:sr-only">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mx-4 border-t border-sidebar-foreground/15 py-4">
          <button
            type="button"
            title={collapsed ? (user?.name ?? user?.email ?? undefined) : undefined}
            className="flex w-full items-center gap-3 rounded-lg p-1 text-left hover:bg-sidebar-foreground/5 group-data-[collapsed=true]/sb:lg:justify-center"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-foreground/15 text-sm font-semibold">
              {getInitials(user)}
            </span>
            <span className="min-w-0 flex-1 group-data-[collapsed=true]/sb:lg:sr-only">
              <span className="block truncate text-sm font-medium">{user?.name ?? user?.email ?? ""}</span>
              <span className="block truncate text-xs text-sidebar-foreground/70">{user?.name ? user.email : ""}</span>
            </span>
            <ChevronDown className="size-4 text-sidebar-foreground/70 group-data-[collapsed=true]/sb:lg:hidden" />
          </button>
        </div>

        <div className="mx-4 border-t border-sidebar-foreground/15 py-4">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-sm font-medium text-sidebar-foreground/85 hover:text-sidebar-foreground group-data-[collapsed=true]/sb:lg:justify-center"
          >
            <LogOut className="size-5 shrink-0" />
            <span className="group-data-[collapsed=true]/sb:lg:sr-only">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
