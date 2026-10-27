import { CircleAlert, type LucideIcon } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)} />;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Inline error for a failed query or mutation. */
export function ErrorMessage({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{getApiErrorMessage(error)}</p>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
