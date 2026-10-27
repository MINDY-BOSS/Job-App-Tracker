"use client";

import { SelectField } from "@/components/ui/field";
import { useApplications } from "@/lib/queries";
import type { LinkedApplication } from "@/types/workspace.types";

interface ApplicationSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  /** The currently linked application, shown even if it isn't in the loaded page. */
  current?: LinkedApplication | null;
}

/** Picker for linking a note or document to one of the user's applications ("" = none). */
export function ApplicationSelect({
  value,
  onChange,
  label = "Linked application",
  hint,
  current,
}: ApplicationSelectProps) {
  const { data, isPending } = useApplications({ pageSize: 100, sort: "-appliedAt" });
  const options = data?.items ?? [];
  const missingCurrent = current && !options.some((app) => app.id === current.id) ? current : null;

  return (
    <SelectField
      label={label}
      hint={hint}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={isPending}
    >
      <option value="">{isPending ? "Loading applications…" : "None"}</option>
      {missingCurrent && (
        <option value={missingCurrent.id}>
          {missingCurrent.company} — {missingCurrent.role}
        </option>
      )}
      {options.map((app) => (
        <option key={app.id} value={app.id}>
          {app.company} — {app.role}
        </option>
      ))}
    </SelectField>
  );
}
