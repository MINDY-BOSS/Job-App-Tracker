"use client";

import { useState } from "react";

import { ApplicationSelect } from "@/components/workspace/application-select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField, SelectField } from "@/components/ui/field";
import { useUpdateDocument } from "@/lib/queries";
import type { DocumentKind, JobDocument } from "@/types/workspace.types";
import { DOCUMENT_KINDS } from "./document-meta";

export function EditDocumentDialog({
  document,
  onClose,
}: {
  document: JobDocument | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!document} onClose={onClose} title="Edit document">
      {/* Keyed so the form resets to each document's values. */}
      {document && <EditDocumentForm key={document.id} document={document} onDone={onClose} />}
    </Dialog>
  );
}

function EditDocumentForm({ document, onDone }: { document: JobDocument; onDone: () => void }) {
  const update = useUpdateDocument();
  const [name, setName] = useState(document.name);
  const [kind, setKind] = useState<DocumentKind>(document.kind);
  const [applicationId, setApplicationId] = useState(document.applicationId ?? "");
  const nameError = name.trim() ? undefined : "Enter a name";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (nameError) return;
    update.mutate(
      { id: document.id, name: name.trim(), kind, applicationId: applicationId || null },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <ErrorMessage error={update.error} />
      <InputField
        label="Name"
        required
        maxLength={200}
        value={name}
        error={nameError}
        onChange={(event) => setName(event.target.value)}
      />
      <SelectField label="Type" value={kind} onChange={(event) => setKind(event.target.value as DocumentKind)}>
        {DOCUMENT_KINDS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <ApplicationSelect value={applicationId} onChange={setApplicationId} current={document.application} />
      <div className="flex justify-end gap-3 pt-1">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={update.isPending} disabled={!!nameError}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
