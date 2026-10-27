"use client";

import { ChevronLeft, ChevronRight, ClipboardList, Plus, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/dashboard/card";
import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, ErrorMessage, PageHeader, Skeleton } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/constants/routes";
import { useApplications, useDeleteApplication } from "@/lib/queries";
import { cn, formatDay } from "@/lib/utils";
import type { Application, ApplicationSort, ApplicationStatus } from "@/types/application.types";
import { RowMenu } from "./row-menu";

const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: ApplicationSort; label: string }[] = [
  { value: "-appliedAt", label: "Newest applied" },
  { value: "appliedAt", label: "Oldest applied" },
  { value: "dueAt", label: "Deadline (soonest)" },
  { value: "company", label: "Company (A–Z)" },
  { value: "-company", label: "Company (Z–A)" },
  { value: "-updatedAt", label: "Recently updated" },
];

const isStatus = (value: string | null): value is ApplicationStatus =>
  !!value && (STATUS_ORDER as string[]).includes(value);
const isSort = (value: string | null): value is ApplicationSort =>
  !!value && SORT_OPTIONS.some((option) => option.value === value);

export function ApplicationsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = isStatus(searchParams.get("status")) ? (searchParams.get("status") as ApplicationStatus) : undefined;
  const sort = isSort(searchParams.get("sort")) ? (searchParams.get("sort") as ApplicationSort) : "-appliedAt";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  /** Replaces the given params (empty values are removed); resets to page 1 unless page is set. */
  const updateParams = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!("page" in changes)) params.delete("page");
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // The search box is local so typing stays snappy; the URL updates after a pause.
  const [search, setSearch] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    // URL changed from outside (e.g. the topbar search): adopt it.
    setSyncedQ(q);
    // Skip when it's our own debounced update, so a trailing space mid-typing survives.
    if (search.trim() !== q) setSearch(q);
  }
  useEffect(() => {
    if (search.trim() === q) return;
    const timer = setTimeout(() => updateParams({ q: search.trim() || undefined }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateParams reads the latest params each render
  }, [search, q]);

  const { data, isPending, isFetching, error } = useApplications({
    q: q || undefined,
    status,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const deleteMutation = useDeleteApplication();
  const [toDelete, setToDelete] = useState<Application | null>(null);

  const filtering = !!(q || status);
  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Deleting the last row of the last page would leave an empty page; step back.
  useEffect(() => {
    if (data && data.items.length === 0 && page > 1 && total > 0) {
      updateParams({ page: String(lastPage) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, total, lastPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Every job you've applied to, in one place."
        actions={
          <Link href={ROUTES.newApplication} className={buttonVariants()}>
            <Plus />
            Add application
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:px-5">
          <label className="relative flex-1">
            <span className="sr-only">Search applications</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, role or location…"
              className="pl-9"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select
              aria-label="Filter by status"
              value={status ?? ""}
              onChange={(event) => updateParams({ status: event.target.value || undefined })}
              className="sm:w-40"
            >
              <option value="">All statuses</option>
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Sort applications"
              value={sort}
              onChange={(event) =>
                updateParams({ sort: event.target.value === "-appliedAt" ? undefined : event.target.value })
              }
              className="sm:w-48"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error ? (
          <div className="p-5">
            <ErrorMessage error={error} />
          </div>
        ) : isPending ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          filtering ? (
            <EmptyState
              icon={SearchX}
              title="No matching applications"
              description="Try a different search or clear the filters."
              action={
                <Button variant="outline" onClick={() => {
                  setSearch("");
                  updateParams({ q: undefined, status: undefined });
                }}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No applications yet"
              description="Add the jobs you've applied to and track them from first click to offer."
              action={
                <Link href={ROUTES.newApplication} className={buttonVariants()}>
                  <Plus />
                  Add application
                </Link>
              }
            />
          )
        ) : (
          <>
            <div className={cn("overflow-x-auto transition-opacity", isFetching && "opacity-60")}>
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium sm:px-5">Company</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Applied</th>
                    <th className="px-3 py-3 font-medium">Deadline</th>
                    <th className="w-12 px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((app) => (
                    <tr key={app.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 sm:px-5">
                        <Link
                          href={ROUTES.application(app.id)}
                          className="flex items-center gap-3 font-medium hover:text-primary"
                        >
                          <CompanyAvatar name={app.company} />
                          {app.company}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span className="block max-w-[240px] truncate" title={app.role}>
                          {app.role}
                        </span>
                        {app.location && (
                          <span className="block max-w-[240px] truncate text-xs text-muted-foreground">
                            {app.location}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">{formatDay(app.appliedAt)}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDay(app.dueAt)}</td>
                      <td className="px-3 py-3">
                        <RowMenu
                          label={`Actions for ${app.role} at ${app.company}`}
                          items={[
                            { label: "View", href: ROUTES.application(app.id) },
                            { label: "Edit", href: ROUTES.editApplication(app.id) },
                            { label: "Delete", onSelect: () => setToDelete(app), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:px-5">
              <p className="text-muted-foreground" aria-live="polite">
                Showing {from}–{to} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: page - 1 > 1 ? String(page - 1) : undefined })}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <span className="px-1 text-muted-foreground">
                  Page {page} of {lastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete application?"
        description={
          toDelete ? `${toDelete.role} at ${toDelete.company} will be permanently removed.` : ""
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y" aria-busy="true" aria-label="Loading applications">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}
