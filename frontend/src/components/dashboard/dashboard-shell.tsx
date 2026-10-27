"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { QueryProvider } from "@/components/providers/query-provider";
import { Sidebar } from "./sidebar";
import { useSidebarCollapsed } from "./sidebar-state";
import { Topbar } from "./topbar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/applications": "Applications",
  "/applications/new": "Add Application",
  "/calendar": "Calendar",
  "/statistics": "Statistics",
  "/documents": "Documents",
  "/companies": "Companies",
  "/notes": "Notes",
  "/settings": "Settings",
};

function pageTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.endsWith("/edit")) return "Edit Application";
  if (pathname.startsWith("/applications/")) return "Application";
  return "JobTracker";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            title={pageTitle(pathname)}
            onMenuClick={() => setMenuOpen(true)}
          />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
