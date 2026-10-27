import { File as FileIcon, FileImage, FileText, type LucideIcon } from "lucide-react";

import type { DocumentKind } from "@/types/workspace.types";

export const DOCUMENT_KINDS: { value: DocumentKind; label: string; plural: string }[] = [
  { value: "cv", label: "CV", plural: "CVs" },
  { value: "cover_letter", label: "Cover letter", plural: "Cover letters" },
  { value: "other", label: "Other", plural: "Other" },
];

export const KIND_LABEL: Record<DocumentKind, string> = {
  cv: "CV",
  cover_letter: "Cover letter",
  other: "Other",
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md", ".png", ".jpg", ".jpeg"];

/** Client-side check before uploading; returns an error message or null. */
export function validateUpload(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Upload a PDF, Word document, text file or image (PNG/JPG).";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That file is larger than 10 MB. Try compressing it or exporting a smaller PDF.";
  }
  return null;
}

export function documentIcon(mimeType: string): { icon: LucideIcon; className: string } {
  if (mimeType.startsWith("image/")) {
    return { icon: FileImage, className: "bg-status-interview-soft text-status-interview-ink" };
  }
  if (mimeType === "application/pdf") {
    return { icon: FileText, className: "bg-status-rejected-soft text-status-rejected-ink" };
  }
  if (mimeType.includes("word")) {
    return { icon: FileText, className: "bg-status-applied-soft text-status-applied-ink" };
  }
  return { icon: FileIcon, className: "bg-muted text-muted-foreground" };
}

/** "Jane CV.pdf" → "Jane CV" */
export function stripExtension(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}
