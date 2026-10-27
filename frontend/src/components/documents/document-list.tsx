"use client";

import { Download, FileText, Link2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/dashboard/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api";
import { downloadDocument, useDeleteDocument, useDocuments } from "@/lib/queries";
import { cn, formatDateTime, formatFileSize } from "@/lib/utils";
import type { DocumentKind, JobDocument } from "@/types/workspace.types";
import { DOCUMENT_KINDS, KIND_LABEL, documentIcon } from "./document-meta";
import { EditDocumentDialog } from "./edit-document-dialog";

type Filter = "all" | DocumentKind;

export function DocumentList() {
  const { data: documents, isPending, error } = useDocuments();
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<JobDocument | null>(null);
  const [deleting, setDeleting] = useState<JobDocument | null>(null);
  const remove = useDeleteDocument();

  const counts = (documents ?? []).reduce<Record<Filter, number>>(
    (acc, doc) => {
      acc[doc.kind]++;
      acc.all++;
      return acc;
    },
    { all: 0, cv: 0, cover_letter: 0, other: 0 },
  );
  const visible = (documents ?? []).filter((doc) => filter === "all" || doc.kind === filter);
  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...DOCUMENT_KINDS.map((kind) => ({ value: kind.value, label: kind.plural })),
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h3 className="text-base font-semibold">Your documents</h3>
        <div role="tablist" aria-label="Filter by type" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none",
                filter === tab.value && "bg-card text-foreground shadow-xs",
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{counts[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorMessage error={error} className="m-4" />
      ) : isPending ? (
        <ul className="divide-y" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={counts.all === 0 ? "No documents yet" : `No ${tabs.find((t) => t.value === filter)?.label.toLowerCase()}`}
          description={
            counts.all === 0
              ? "Upload your CV and cover letters so they're ready when you apply."
              : "Documents of this type will show up here."
          }
        />
      ) : (
        <ul className="divide-y">
          {visible.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} onEdit={() => setEditing(doc)} onDelete={() => setDeleting(doc)} />
          ))}
        </ul>
      )}

      <EditDocumentDialog document={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        loading={remove.isPending}
        title="Delete document?"
        description={
          remove.error
            ? getApiErrorMessage(remove.error)
            : `“${deleting?.name}” will be permanently deleted.`
        }
      />
    </Card>
  );
}

function DocumentRow({
  doc,
  onEdit,
  onDelete,
}: {
  doc: JobDocument;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { icon: Icon, className } = documentIcon(doc.mimeType);

  async function download() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadDocument(doc);
    } catch (error) {
      setDownloadError(getApiErrorMessage(error, "Download failed. Please try again."));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:flex-nowrap sm:px-5">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", className)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{doc.name}</p>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{KIND_LABEL[doc.kind]}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {doc.fileName} · {formatFileSize(doc.size)} · Uploaded {formatDateTime(doc.createdAt)}
        </p>
        {doc.application && (
          <Link
            href={ROUTES.application(doc.application.id)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Link2 className="size-3.5" aria-hidden="true" />
            {doc.application.company} — {doc.application.role}
          </Link>
        )}
        {downloadError && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {downloadError}
          </p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={download}
          loading={downloading}
          aria-label={`Download ${doc.name}`}
          title="Download"
        >
          {!downloading && <Download />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${doc.name}`} title="Edit">
          <Pencil />
        </Button>
        <Button
          variant="danger-ghost"
          size="icon"
          onClick={onDelete}
          aria-label={`Delete ${doc.name}`}
          title="Delete"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
