"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Plus, RefreshCw, Search, SearchX, Settings2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { Input, InputField, Select, SelectField } from "@/components/ui/field";
import { ROUTES } from "@/constants/routes";
import { queryKeys, useDetectBoard, useOpenings, useRefreshOpenings, useSaveCompany } from "@/lib/queries";
import { cn, formatRelativeDays } from "@/lib/utils";
import type { AtsProvider, CompanySummary, JobBoard, JobOpening } from "@/types/workspace.types";
import { boardUrlHint, formatAgo, providerLabel, PROVIDERS, SLUG_PATTERN } from "./job-board";

const PAGE_SIZE = 50;

interface OpeningsDialogProps {
  /** The saved company (always has an id by the time this opens). */
  company: CompanySummary | null;
  onClose: () => void;
}

export function OpeningsDialog({ company, onClose }: OpeningsDialogProps) {
  return (
    <Dialog
      open={!!company}
      onClose={onClose}
      title={company ? `Open positions at ${company.name}` : "Open positions"}
      className="max-w-3xl"
    >
      {company?.id && <OpeningsPanel company={company} companyId={company.id} />}
    </Dialog>
  );
}

function OpeningsPanel({ company, companyId }: { company: CompanySummary; companyId: string }) {
  const hasBoard = !!company.atsProvider && !!company.atsSlug;
  const [editingBoard, setEditingBoard] = useState(false);
  const detect = useDetectBoard();
  const openings = useOpenings(companyId, hasBoard && !editingBoard);

  if (editingBoard || (!hasBoard && detect.data?.found === false)) {
    return (
      <BoardSettingsForm
        company={company}
        companyId={companyId}
        notFound={!hasBoard && detect.data?.found === false}
        onSaved={() => setEditingBoard(false)}
        onCancel={hasBoard ? () => setEditingBoard(false) : undefined}
      />
    );
  }

  if (!hasBoard) {
    return (
      <div className="space-y-4">
        <ErrorMessage error={detect.error} />
        <EmptyState
          icon={Search}
          title="No job board connected yet"
          description="We can look for this company's careers page on Greenhouse, Lever and Ashby."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => detect.mutate(companyId)} loading={detect.isPending}>
                {detect.isPending ? "Checking Greenhouse, Lever and Ashby…" : "Find job board"}
              </Button>
              {!detect.isPending && (
                <Button variant="outline" onClick={() => setEditingBoard(true)}>
                  Enter it manually
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  if (openings.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading openings">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (openings.isError) {
    const status = axios.isAxiosError(openings.error) ? openings.error.response?.status : undefined;
    return (
      <div className="space-y-4">
        <ErrorMessage error={openings.error} />
        <p className="text-sm text-muted-foreground">
          {status === 404
            ? "The board slug may be wrong, or the company has moved to a different provider."
            : "The job board couldn't be reached. Try again in a moment."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => openings.refetch()} loading={openings.isFetching}>
            <RefreshCw /> Try again
          </Button>
          <Button variant="outline" onClick={() => setEditingBoard(true)}>
            <Settings2 /> Change board settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <BoardOpenings
      board={openings.data}
      company={company}
      companyId={companyId}
      onEditBoard={() => setEditingBoard(true)}
    />
  );
}

function BoardOpenings({
  board,
  company,
  companyId,
  onEditBoard,
}: {
  board: JobBoard;
  company: CompanySummary;
  companyId: string;
  onEditBoard: () => void;
}) {
  const refresh = useRefreshOpenings(companyId);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const departments = useMemo(
    () =>
      [...new Set(board.jobs.map((job) => job.department).filter((d): d is string => !!d))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [board.jobs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return board.jobs.filter(
      (job) =>
        (!q || job.title.toLowerCase().includes(q)) &&
        (!department || job.department === department) &&
        (!remoteOnly || job.remote),
    );
  }, [board.jobs, query, department, remoteOnly]);

  // Any filter change starts the list from the top again.
  const updateFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium">{providerLabel(board.provider)}</span>
          <a
            href={board.boardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Public board <ExternalLink className="size-3" aria-hidden="true" />
          </a>
          <span className="text-muted-foreground">Updated {formatAgo(board.fetchedAt)}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEditBoard}>
            <Settings2 /> Board
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refresh.mutate()} loading={refresh.isPending}>
            {!refresh.isPending && <RefreshCw />} Refresh
          </Button>
        </div>
      </div>
      <ErrorMessage error={refresh.error} />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => updateFilter(setQuery)(event.target.value)}
            placeholder="Search job titles…"
            aria-label="Search job titles"
            className="pl-9"
          />
        </div>
        {departments.length > 1 && (
          <Select
            value={department}
            onChange={(event) => updateFilter(setDepartment)(event.target.value)}
            aria-label="Department"
            className="sm:w-56"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium" aria-live="polite">
          {filtered.length} open role{filtered.length === 1 ? "" : "s"}
          {filtered.length !== board.jobs.length && (
            <span className="font-normal text-muted-foreground"> of {board.jobs.length}</span>
          )}
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(event) => updateFilter(setRemoteOnly)(event.target.checked)}
            className="size-4 accent-(--primary)"
          />
          Remote only
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={board.jobs.length ? "No roles match your filters" : "No open roles right now"}
          description={
            board.jobs.length
              ? "Try a different search or clear the filters."
              : `${company.name} has no published openings on this board.`
          }
        />
      ) : (
        <ul className="divide-y rounded-lg border">
          {filtered.slice(0, visible).map((job) => (
            <OpeningRow key={job.id} job={job} company={company.name} />
          ))}
        </ul>
      )}

      {filtered.length > visible && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show more ({filtered.length - visible} left)
          </Button>
        </div>
      )}
    </div>
  );
}

function OpeningRow({ job, company }: { job: JobOpening; company: string }) {
  const params = new URLSearchParams({ company, role: job.title, jobUrl: job.url });
  if (job.location) params.set("location", job.location);

  return (
    <li className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">{job.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.department && <span>{job.department}</span>}
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" aria-hidden="true" />
              {job.location}
            </span>
          )}
          {job.employmentType && <span>{job.employmentType}</span>}
          {job.postedAt && <span>Posted {formatRelativeDays(job.postedAt)}</span>}
          {job.remote && (
            <span className="rounded bg-status-offer-soft px-1.5 py-0.5 font-medium text-status-offer-ink">
              Remote
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View posting <ExternalLink aria-hidden="true" />
        </a>
        <Link href={`${ROUTES.newApplication}?${params}`} className={cn(buttonVariants({ size: "sm" }))}>
          <Plus aria-hidden="true" /> Track this job
        </Link>
      </div>
    </li>
  );
}

function BoardSettingsForm({
  company,
  companyId,
  notFound,
  onSaved,
  onCancel,
}: {
  company: CompanySummary;
  companyId: string;
  notFound: boolean;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const client = useQueryClient();
  const save = useSaveCompany();
  const [provider, setProvider] = useState<AtsProvider | "">(company.atsProvider ?? "");
  const [slug, setSlug] = useState(company.atsSlug ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = slug.trim();
    if (!provider) return setError("Choose a provider");
    if (!trimmed || !SLUG_PATTERN.test(trimmed)) {
      return setError('Enter a slug using only letters, numbers, ".", "_" and "-"');
    }
    setError(null);
    try {
      await save.mutateAsync({ id: companyId, atsProvider: provider, atsSlug: trimmed });
      // Drop any cached failure so the new board loads fresh.
      client.removeQueries({ queryKey: queryKeys.openings(companyId) });
      onSaved();
    } catch {
      // Shown via save.error.
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {notFound && (
        <p className="rounded-lg border bg-muted/60 p-3 text-sm">
          We couldn&apos;t find a public Greenhouse, Lever or Ashby board for <strong>{company.name}</strong>. If
          you know where they post jobs, enter it below. Their careers page URL usually contains it.
        </p>
      )}
      <ErrorMessage error={save.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Job board provider"
          value={provider}
          onChange={(event) => setProvider(event.target.value as AtsProvider | "")}
        >
          <option value="">Choose…</option>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Board slug"
          placeholder="stripe"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          error={error ?? undefined}
        />
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{boardUrlHint(provider, slug.trim())}</p>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={save.isPending}>
          Save and load openings
        </Button>
      </div>
    </form>
  );
}
