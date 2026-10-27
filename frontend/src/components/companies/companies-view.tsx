"use client";

import { useMemo, useState } from "react";
import { Building2, Plus, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, ErrorMessage, PageHeader, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";
import { useCompanies, useDeleteCompany, useSaveCompany } from "@/lib/queries";
import type { CompanySummary } from "@/types/workspace.types";
import { CompanyCard } from "./company-card";
import { CompanyFormDialog } from "./company-form-dialog";
import { OpeningsDialog } from "./openings-dialog";

const key = (name: string) => name.trim().toLowerCase();

export function CompaniesView() {
  const companies = useCompanies();
  const save = useSaveCompany();
  const remove = useDeleteCompany();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CompanySummary | null>(null);
  const [deleting, setDeleting] = useState<CompanySummary | null>(null);
  // Tracked by name so the dialog follows the row as the list refetches (id appears once saved).
  const [openingsFor, setOpeningsFor] = useState<string | null>(null);
  const [preparing, setPreparing] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (companies.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [companies.data, query]);

  const openingsCompany =
    (openingsFor && companies.data?.find((c) => key(c.name) === openingsFor && c.id)) || null;

  async function viewOpenings(company: CompanySummary) {
    if (company.id) {
      setOpeningsFor(key(company.name));
      return;
    }
    // Companies known only from applications need a saved record to hold their board.
    setPreparing(key(company.name));
    try {
      await save.mutateAsync({ name: company.name });
      await companies.refetch();
      setOpeningsFor(key(company.name));
    } catch {
      // Shown via save.error.
    } finally {
      setPreparing(null);
    }
  }

  const openForm = (company: CompanySummary | null) => {
    setEditing(company);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Everywhere you've applied, plus live openings from their job boards."
        actions={
          <Button onClick={() => openForm(null)}>
            <Plus /> Add company
          </Button>
        }
      />

      {companies.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading companies">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : companies.isError ? (
        <ErrorMessage error={companies.error} />
      ) : companies.data.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-xs">
          <EmptyState
            icon={Building2}
            title="No companies yet"
            description="Companies appear here automatically when you track an application. You can also add one to browse its open positions."
            action={
              <Button onClick={() => openForm(null)}>
                <Plus /> Add company
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search companies…"
              aria-label="Search companies"
              className="pl-9"
            />
          </div>

          <ErrorMessage error={save.error ?? remove.error} />

          {filtered.length === 0 ? (
            <div className="rounded-xl border bg-card shadow-xs">
              <EmptyState icon={SearchX} title="No companies match" description="Try a different name." />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((company) => (
                <CompanyCard
                  key={key(company.name)}
                  company={company}
                  opening={preparing === key(company.name)}
                  onViewOpenings={() => viewOpenings(company)}
                  onEdit={() => openForm(company)}
                  onDelete={() => setDeleting(company)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <CompanyFormDialog open={formOpen} company={editing} onClose={() => setFormOpen(false)} />

      <OpeningsDialog company={openingsCompany} onClose={() => setOpeningsFor(null)} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name ?? "company"}?`}
        description={
          deleting?.applicationCount
            ? "This removes the saved details and job board. Your applications stay, so the company will still be listed."
            : "This removes the company and its job board connection."
        }
        loading={remove.isPending}
        onConfirm={() => {
          if (!deleting?.id) return;
          remove.mutate(deleting.id, { onSettled: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
