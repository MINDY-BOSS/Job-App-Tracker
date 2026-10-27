"use client";

import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CalendarDays,
  CalendarX,
  ExternalLink,
  MapPin,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Card } from "@/components/dashboard/card";
import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/feedback";
import { Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/constants/routes";
import { useApplication, useDeleteApplication, useUpdateApplication } from "@/lib/queries";
import { formatDateTime, formatDay, formatRelativeDays } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application.types";
import { ApplicationLoadError, ApplicationSkeleton } from "./application-states";

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: app, isPending, error } = useApplication(id);
  const update = useUpdateApplication(id);
  const remove = useDeleteApplication();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isPending) return <ApplicationSkeleton />;
  if (error || !app) return <ApplicationLoadError error={error} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={ROUTES.applications}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All applications
      </Link>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="[&>*]:size-14 [&>*]:rounded-xl [&>*]:text-xl">
              <CompanyAvatar name={app.company} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold break-words">{app.role}</h2>
              <p className="mt-0.5 text-muted-foreground">{app.company}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={app.status} />
                <span>Updated {formatRelativeDays(app.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              aria-label="Change status"
              value={app.status}
              disabled={update.isPending}
              onChange={(event) => update.mutate({ status: event.target.value as ApplicationStatus })}
              className="w-36"
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>
            <Link href={ROUTES.editApplication(app.id)} className={buttonVariants({ variant: "outline" })}>
              <Pencil />
              Edit
            </Link>
            <Button variant="danger-ghost" size="icon" aria-label="Delete application" onClick={() => setConfirmDelete(true)}>
              <Trash2 />
            </Button>
          </div>
        </div>
        <ErrorMessage error={update.error} className="mt-4" />
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="mb-4 font-semibold">Details</h3>
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Detail icon={CalendarDays} label="Applied" value={formatDay(app.appliedAt)} />
          <Detail
            icon={CalendarX}
            label="Application deadline"
            value={app.dueAt ? `${formatDay(app.dueAt)} (${formatRelativeDays(app.dueAt.slice(0, 10) + "T00:00:00")})` : null}
          />
          <Detail icon={CalendarClock} label="Interview" value={app.interviewAt ? formatDateTime(app.interviewAt) : null} />
          <Detail icon={MapPin} label="Location" value={app.location} />
          <Detail icon={Banknote} label="Salary" value={app.salary} />
          <Detail
            icon={ExternalLink}
            label="Job posting"
            value={
              app.jobUrl ? (
                <a
                  href={app.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium break-all text-primary hover:underline"
                >
                  {app.jobUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              ) : null
            }
          />
        </dl>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="mb-3 font-semibold">Notes</h3>
        {app.notes ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{app.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No notes yet.{" "}
            <Link href={ROUTES.editApplication(app.id)} className="font-medium text-primary hover:underline">
              Add some
            </Link>
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete application?"
        description={`${app.role} at ${app.company} will be permanently removed.`}
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(app.id, {
            onSuccess: () => router.replace(ROUTES.applications),
          })
        }
      />
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm">{value || <span className="text-muted-foreground">—</span>}</dd>
      </div>
    </div>
  );
}
