import Link from "next/link";
import { Briefcase, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/constants/routes";
import { cn, formatRelativeDays } from "@/lib/utils";
import type { CompanySummary } from "@/types/workspace.types";
import { providerLabel, websiteHref } from "./job-board";

interface CompanyCardProps {
  company: CompanySummary;
  onViewOpenings: () => void;
  onEdit: () => void;
  onDelete: () => void;
  opening?: boolean;
}

export function CompanyCard({ company, onViewOpenings, onEdit, onDelete, opening }: CompanyCardProps) {
  const applicationsHref = `${ROUTES.applications}?${new URLSearchParams({ company: company.name })}`;

  return (
    <article className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <CompanyAvatar name={company.name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{company.name}</h3>
          {company.website ? (
            <a
              href={websiteHref(company.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate text-xs text-primary hover:underline"
            >
              <span className="truncate">{company.website.replace(/^https?:\/\//i, "")}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">No website</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${company.name}`}>
            <Pencil />
          </Button>
          {company.id && (
            <Button
              variant="danger-ghost"
              size="icon-sm"
              onClick={onDelete}
              aria-label={`Delete ${company.name}`}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">
          {company.applicationCount} application{company.applicationCount === 1 ? "" : "s"}
        </span>
        {company.latestStatus && <StatusBadge status={company.latestStatus} />}
        {company.lastAppliedAt && (
          <span className="text-xs text-muted-foreground">
            Applied {formatRelativeDays(company.lastAppliedAt)}
          </span>
        )}
      </div>

      <div className="mt-3">
        {company.atsProvider && company.atsSlug ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            {providerLabel(company.atsProvider)} · {company.atsSlug}
          </span>
        ) : (
          <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            No job board
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button size="sm" onClick={onViewOpenings} loading={opening}>
          {!opening && <Briefcase />}
          View openings
        </Button>
        {company.applicationCount > 0 && (
          <Link href={applicationsHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            View applications
          </Link>
        )}
      </div>
    </article>
  );
}
