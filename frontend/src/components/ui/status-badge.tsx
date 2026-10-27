import { STATUS_META } from "@/components/dashboard/status";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application.types";

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap",
        STATUS_META[status].badgeClass,
        className,
      )}
    >
      {STATUS_META[status].label}
    </span>
  );
}
