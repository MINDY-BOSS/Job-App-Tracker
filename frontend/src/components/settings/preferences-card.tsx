"use client";

import { LogOut, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSidebarCollapsed } from "@/components/dashboard/sidebar-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-section";

export function PreferencesCard() {
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <SettingsSection icon={SlidersHorizontal} title="Preferences" description="Saved in this browser.">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p id="pref-sidebar" className="text-sm font-medium">
            Compact sidebar
          </p>
          <p className="text-sm text-muted-foreground">Show only icons in the sidebar on larger screens.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={collapsed}
          aria-labelledby="pref-sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none",
            collapsed ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "inline-block size-5 rounded-full bg-card shadow-sm transition-transform",
              collapsed ? "translate-x-5.5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </SettingsSection>
  );
}

export function SessionCard() {
  const router = useRouter();

  function logout() {
    clearToken();
    router.push(ROUTES.login);
  }

  return (
    <SettingsSection icon={LogOut} title="Session" description="Sign out of JobTracker on this device.">
      <Button variant="outline" onClick={logout}>
        <LogOut />
        Log out
      </Button>
    </SettingsSection>
  );
}
