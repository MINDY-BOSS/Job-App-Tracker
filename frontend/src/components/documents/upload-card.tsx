"use client";

import { CloudUpload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { FormError } from "@/components/auth/form-error";
import { Card } from "@/components/dashboard/card";
import { ApplicationSelect } from "@/components/workspace/application-select";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField, SelectField } from "@/components/ui/field";
import { useUploadDocument } from "@/lib/queries";
import { cn, formatFileSize } from "@/lib/utils";
import type { DocumentKind } from "@/types/workspace.types";
import {
  ACCEPTED_EXTENSIONS,
  DOCUMENT_KINDS,
  documentIcon,
  stripExtension,
  validateUpload,
} from "./document-meta";

export function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const upload = useUploadDocument();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DocumentKind>("cv");
  const [applicationId, setApplicationId] = useState("");
  const [uploaded, setUploaded] = useState<string | null>(null);

  function choose(next: File | undefined) {
    if (!next) return;
    upload.reset();
    setUploaded(null);
    const error = validateUpload(next);
    setFileError(error);
    setFile(error ? null : next);
    if (!error) setName(stripExtension(next.name));
  }

  function clear() {
    setFile(null);
    setName("");
    setApplicationId("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    upload.mutate(
      { file, name: name.trim() || undefined, kind, applicationId: applicationId || null },
      {
        onSuccess: (doc) => {
          setUploaded(doc.name);
          clear();
        },
      },
    );
  }

  const preview = file ? documentIcon(file.type) : null;

  return (
    <Card className="p-4 sm:p-5">
      <h3 className="text-base font-semibold">Upload a document</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        CVs, cover letters and anything else you send with applications. Up to 10 MB.
      </p>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            choose(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5 focus-within:ring-4 focus-within:ring-primary/15",
            dragging ? "border-primary bg-primary/5" : "border-input",
          )}
        >
          <CloudUpload className="size-8 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">
            Drag a file here or <span className="text-primary underline-offset-4 hover:underline">browse</span>
          </span>
          <span className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, MD, PNG or JPG</span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="sr-only"
            onChange={(event) => choose(event.target.files?.[0])}
          />
        </label>

        <FormError message={fileError} />

        {file && preview && (
          <div className="flex items-center gap-3 rounded-lg border bg-surface p-3">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", preview.className)}>
              <preview.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{file.name}</span>
              <span className="block text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
            </span>
            <Button variant="ghost" size="icon-sm" onClick={clear} aria-label="Remove selected file">
              <X />
            </Button>
          </div>
        )}

        {file && (
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Display name"
              value={name}
              maxLength={200}
              onChange={(event) => setName(event.target.value)}
              className="sm:col-span-2"
            />
            <SelectField
              label="Type"
              value={kind}
              onChange={(event) => setKind(event.target.value as DocumentKind)}
            >
              {DOCUMENT_KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <ApplicationSelect value={applicationId} onChange={setApplicationId} />
          </div>
        )}

        <ErrorMessage error={upload.error} />
        {uploaded && (
          <p role="status" className="text-sm font-medium text-success">
            “{uploaded}” uploaded.
          </p>
        )}

        {file && (
          <div className="flex justify-end">
            <Button type="submit" loading={upload.isPending}>
              {upload.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
